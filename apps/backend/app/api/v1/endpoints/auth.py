"""
Authentication API Endpoints.
"""

import uuid
from datetime import datetime, timedelta, timezone
import logging
from typing import Any
logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth
from pydantic import BaseModel

from app.api.deps import DbSession, CurrentUser
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.models.auth import Session, VerificationToken, TokenType
from app.schemas.auth import (
    Token,
    UserCreate,
    UserResponse,
    LoginRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)

router = APIRouter()

# Setup Authlib for Google OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

class VerifyTokenRequest(BaseModel):
    token: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: DbSession) -> Any:
    """Register a new user."""
    # Check if user exists
    result = await db.execute(select(User).filter(User.email == user_in.email))
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    await db.flush()  # To get user.id

    # Create verification token
    verification_token = VerificationToken(
        user_id=user.id,
        token=str(uuid.uuid4()),
        token_type=TokenType.VERIFICATION.value,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(verification_token)
    await db.commit()
    await db.refresh(user)

    logger.info(f"MOCK EMAIL: Verification link -> /verify?token={verification_token.token}")

    return user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    db: DbSession,
) -> Any:
    """Authenticate user and issue tokens."""
    result = await db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # Store refresh token in DB
    session = Session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(session)
    await db.commit()

    # Set Refresh Token in secure HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Set to False if local HTTP only, but typical proxy setup handles this
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response, db: DbSession) -> Any:
    """Refresh access token using the refresh token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    # Find session
    result = await db.execute(
        select(Session).filter(Session.refresh_token == refresh_token)
    )
    session = result.scalars().first()

    if not session or session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Issue new access token
    access_token = create_access_token(session.user_id)

    # Optionally rotate refresh token here (security best practice)
    new_refresh_token = create_refresh_token(session.user_id)
    session.refresh_token = new_refresh_token
    session.expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.commit()

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(request: Request, response: Response, db: DbSession) -> Any:
    """Log out user by deleting the session and cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        result = await db.execute(
            select(Session).filter(Session.refresh_token == refresh_token)
        )
        session = result.scalars().first()
        if session:
            await db.delete(session)
            await db.commit()
            
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser) -> Any:
    """Get information about the currently authenticated user."""
    return current_user


@router.post("/verify-email")
async def verify_email(req: VerifyTokenRequest, db: DbSession) -> Any:
    """Verify user's email address."""
    result = await db.execute(
        select(VerificationToken).filter(
            VerificationToken.token == req.token,
            VerificationToken.token_type == TokenType.VERIFICATION.value
        )
    )
    db_token = result.scalars().first()
    
    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    result = await db.execute(select(User).filter(User.id == db_token.user_id))
    user = result.scalars().first()
    
    if user:
        user.is_verified = True
        await db.delete(db_token)
        await db.commit()
        return {"message": "Email verified successfully"}
    
    raise HTTPException(status_code=404, detail="User not found")


@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest, db: DbSession) -> Any:
    """Request a password reset link."""
    result = await db.execute(select(User).filter(User.email == req.email))
    user = result.scalars().first()
    
    if user:
        # Create reset token
        reset_token = VerificationToken(
            user_id=user.id,
            token=str(uuid.uuid4()),
            token_type=TokenType.PASSWORD_RESET.value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(reset_token)
        await db.commit()
        
        # MOCK EMAIL
        logger.info(f"MOCK EMAIL: Reset link -> /reset-password?token={reset_token.token}")
        
    # Always return success to prevent email enumeration
    return {"message": "If an account exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(req: PasswordResetConfirm, db: DbSession) -> Any:
    """Reset password using a token."""
    result = await db.execute(
        select(VerificationToken).filter(
            VerificationToken.token == req.token,
            VerificationToken.token_type == TokenType.PASSWORD_RESET.value
        )
    )
    db_token = result.scalars().first()
    
    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    result = await db.execute(select(User).filter(User.id == db_token.user_id))
    user = result.scalars().first()
    
    if user:
        user.hashed_password = get_password_hash(req.new_password)
        await db.delete(db_token)
        await db.commit()
        return {"message": "Password reset successfully"}
        
    raise HTTPException(status_code=404, detail="User not found")


@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
        
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, str(redirect_uri))


@router.get("/google/callback")
async def google_callback(request: Request, response: Response, db: DbSession):
    """Handle Google OAuth callback."""
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        logger.error(f"OAUTH ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"OAuth failed: {str(e)}")
        
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not fetch user info")
        
    # Check if user exists
    email = user_info.get('email')
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Auto-register
        user = User(
            email=email,
            full_name=user_info.get('name', 'Google User'),
            avatar_url=user_info.get('picture'),
            is_verified=True,  # Google verifies emails
        )
        db.add(user)
        await db.flush()
        
    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    session = Session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(session)
    await db.commit()

    frontend_url = settings.cors_origins_list[0] if settings.cors_origins_list else "https://interviewos.com"
    redirect = RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")
    redirect.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=True, samesite="lax", max_age=7 * 24 * 60 * 60,
    )
    return redirect

