"""
Recruiter Authentication Endpoints.
"""

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status, Request, Response
from sqlalchemy import select

from app.api.deps import DbSession, CurrentRecruiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.core.rate_limit import limiter
from app.models.user import User
from app.models.auth import Session
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.schemas.recruiter import RecruiterRegister, RecruiterMeResponse, OrganizationResponse
from app.schemas.auth import Token, LoginRequest

router = APIRouter()


def _slugify(name: str) -> str:
    """Generate a URL-safe slug from an organization name."""
    slug = re.sub(r"[^\w\s-]", "", name.lower())
    slug = re.sub(r"[-\s]+", "-", slug).strip("-")
    return slug


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def recruiter_register(
    request: Request,
    data: RecruiterRegister,
    db: DbSession,
) -> Any:
    """Register a new recruiter with an organization."""
    # Check if email already exists
    result = await db.execute(select(User).filter(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Check slug uniqueness
    base_slug = _slugify(data.organization_name)
    slug = base_slug
    counter = 1
    while True:
        result = await db.execute(select(Organization).filter(Organization.slug == slug))
        if not result.scalars().first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Create user with recruiter role
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role="recruiter",
        is_verified=True,  # Auto-verify recruiters for now
    )
    db.add(user)
    await db.flush()

    # Create organization
    org = Organization(
        name=data.organization_name,
        slug=slug,
        website=data.website,
        industry=data.industry,
    )
    db.add(org)
    await db.flush()

    # Add user as owner
    member = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role=OrgRole.OWNER.value,
    )
    db.add(member)
    await db.commit()

    return {"message": "Recruiter account created successfully", "organization_slug": slug}


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def recruiter_login(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    db: DbSession,
) -> Any:
    """Authenticate recruiter and issue tokens."""
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

    if user.role not in ("recruiter", "org_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not a recruiter account. Please use the candidate login.",
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # Store refresh token
    session = Session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(session)
    await db.commit()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=RecruiterMeResponse)
@limiter.limit("30/minute")
async def recruiter_me(
    request: Request,
    current_user: CurrentRecruiter,
    db: DbSession,
) -> Any:
    """Get recruiter profile with organization details."""
    # Load organization membership
    stmt = (
        select(OrganizationMember, Organization)
        .join(Organization, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    row = result.first()

    org_data = None
    org_role = None
    if row:
        member, org = row
        org_data = OrganizationResponse.model_validate(org)
        org_role = member.role

    return RecruiterMeResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        organization=org_data,
        org_role=org_role,
    )
