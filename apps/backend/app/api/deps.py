"""
FastAPI Dependencies (Auth, DB).
"""

from typing import Annotated
from typing_extensions import TypeAlias
import uuid

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.engine import get_session
from app.models.user import User
from app.core.config import settings
from app.core.security import ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

DbSession: TypeAlias = Annotated[AsyncSession, Depends(get_session)]
TokenDep: TypeAlias = Annotated[str, Depends(oauth2_scheme)]


async def get_current_user(db: DbSession, token: TokenDep) -> User:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise credentials_exception
        user_id_str: str = str(user_id_raw)

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return user


CurrentUser: TypeAlias = Annotated[User, Depends(get_current_user)]


async def get_current_recruiter(current_user: CurrentUser) -> User:
    """Assert that the current user has a recruiter-level role."""
    if current_user.role not in ("recruiter", "org_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required",
        )
    return current_user


CurrentRecruiter: TypeAlias = Annotated[User, Depends(get_current_recruiter)]


async def get_org_membership(
    current_user: CurrentRecruiter,
    db: DbSession,
):
    """Load the recruiter's organization membership. Returns (member, organization)."""
    from app.models.organization import OrganizationMember, Organization

    stmt = (
        select(OrganizationMember, Organization)
        .join(Organization, OrganizationMember.organization_id == Organization.id)
        .where(OrganizationMember.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of any organization",
        )
    
    return row


OrgMembership: TypeAlias = Annotated[tuple, Depends(get_org_membership)]

