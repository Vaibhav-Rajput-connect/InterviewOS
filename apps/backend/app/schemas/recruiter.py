"""
Pydantic schemas for Recruiter & Organization.
"""

import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# --- Registration ---

class RecruiterRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    organization_name: str = Field(min_length=2, max_length=255)
    website: Optional[str] = None
    industry: Optional[str] = None


# --- Organization ---

class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None


class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Team Members ---

class TeamMemberResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(default="recruiter")


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(...)


# --- Invite ---

class InviteAcceptRequest(BaseModel):
    token: str


class InviteResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    expires_at: datetime
    accepted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Recruiter Dashboard ---

class RecruiterMeResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    organization: Optional[OrganizationResponse] = None
    org_role: Optional[str] = None

    class Config:
        from_attributes = True
