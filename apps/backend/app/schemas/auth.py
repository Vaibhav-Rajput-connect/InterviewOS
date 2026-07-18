"""
Pydantic schemas for authentication.
"""

from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    # Note: refresh_token is typically set as a secure HttpOnly cookie, but we can return it too if needed
    # For now, we rely on cookies for the refresh token to prevent XSS


class UserCreate(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(max_length=100)


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    is_verified: bool
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(max_length=512)
    new_password: str = Field(min_length=8, max_length=128)
