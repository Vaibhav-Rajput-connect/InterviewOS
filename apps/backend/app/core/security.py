"""
Security utilities (Hashing, JWT).
"""

from datetime import datetime, timedelta, timezone
from typing import Any
import uuid

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Setup Passlib with Argon2 for password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Create a new JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default to 15 minutes
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Create a new refresh token (opaque string, typically UUID)."""
    # Using a secure random string/UUID for refresh tokens stored in DB
    return str(uuid.uuid4())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed version."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a hash for a plain password."""
    return pwd_context.hash(password)
