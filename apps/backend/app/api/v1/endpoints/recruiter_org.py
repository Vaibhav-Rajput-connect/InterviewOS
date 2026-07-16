"""
Recruiter Organization Management Endpoints.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status, Request
from sqlalchemy import select

from app.api.deps import DbSession, CurrentRecruiter, OrgMembership
from app.core.rate_limit import limiter
from app.models.user import User
from app.models.organization import Organization, OrganizationMember, OrganizationInvite, OrgRole
from app.schemas.recruiter import (
    OrganizationResponse,
    OrganizationUpdate,
    TeamMemberResponse,
    InviteMemberRequest,
    UpdateMemberRoleRequest,
    InviteAcceptRequest,
    InviteResponse,
)

router = APIRouter()

# Role hierarchy for permission checks
ROLE_HIERARCHY = {
    OrgRole.OWNER.value: 4,
    OrgRole.ADMIN.value: 3,
    OrgRole.RECRUITER.value: 2,
    OrgRole.VIEWER.value: 1,
}


def _assert_min_role(member_role: str, required: str):
    """Assert that the member has at least the required role level."""
    if ROLE_HIERARCHY.get(member_role, 0) < ROLE_HIERARCHY.get(required, 99):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires at least '{required}' role",
        )


@router.get("", response_model=OrganizationResponse)
@limiter.limit("30/minute")
async def get_organization(
    request: Request,
    membership: OrgMembership,
) -> Any:
    """Get the current recruiter's organization profile."""
    member, org = membership
    return org


@router.put("", response_model=OrganizationResponse)
@limiter.limit("15/minute")
async def update_organization(
    request: Request,
    data: OrganizationUpdate,
    membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Update organization profile. Requires admin+ role."""
    member, org = membership
    _assert_min_role(member.role, OrgRole.ADMIN.value)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(org, field, value)

    await db.commit()
    await db.refresh(org)
    return org


@router.get("/members", response_model=list[TeamMemberResponse])
@limiter.limit("30/minute")
async def list_members(
    request: Request,
    membership: OrgMembership,
    db: DbSession,
) -> Any:
    """List all team members in the organization."""
    member, org = membership

    stmt = (
        select(OrganizationMember, User)
        .join(User, OrganizationMember.user_id == User.id)
        .where(OrganizationMember.organization_id == org.id)
        .order_by(OrganizationMember.joined_at)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        TeamMemberResponse(
            id=m.id,
            user_id=m.user_id,
            email=u.email,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            role=m.role,
            joined_at=m.joined_at,
        )
        for m, u in rows
    ]


@router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def invite_member(
    request: Request,
    data: InviteMemberRequest,
    membership: OrgMembership,
    current_user: CurrentRecruiter,
    db: DbSession,
) -> Any:
    """Invite a new team member to the organization. Requires admin+ role."""
    member, org = membership
    _assert_min_role(member.role, OrgRole.ADMIN.value)

    # Validate target role
    if data.role not in [r.value for r in OrgRole]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Can't invite someone with a higher role than yourself
    if ROLE_HIERARCHY.get(data.role, 0) > ROLE_HIERARCHY.get(member.role, 0):
        raise HTTPException(status_code=403, detail="Cannot invite someone with a higher role than yours")

    # Check if user is already a member
    existing = await db.execute(
        select(OrganizationMember)
        .join(User, OrganizationMember.user_id == User.id)
        .where(OrganizationMember.organization_id == org.id, User.email == data.email)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="User is already a member of this organization")

    # Check for pending invite
    existing_invite = await db.execute(
        select(OrganizationInvite).where(
            OrganizationInvite.organization_id == org.id,
            OrganizationInvite.email == data.email,
            OrganizationInvite.accepted_at.is_(None),
        )
    )
    if existing_invite.scalars().first():
        raise HTTPException(status_code=400, detail="An invitation has already been sent to this email")

    invite = OrganizationInvite(
        organization_id=org.id,
        email=data.email,
        role=data.role,
        token=str(uuid.uuid4()),
        invited_by=current_user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)

    return invite


@router.post("/invite/accept")
@limiter.limit("10/minute")
async def accept_invite(
    request: Request,
    data: InviteAcceptRequest,
    current_user: CurrentRecruiter,
    db: DbSession,
) -> Any:
    """Accept an organization invite using the token."""
    result = await db.execute(
        select(OrganizationInvite).where(
            OrganizationInvite.token == data.token,
            OrganizationInvite.accepted_at.is_(None),
        )
    )
    invite = result.scalars().first()

    if not invite:
        raise HTTPException(status_code=400, detail="Invalid or already used invite")

    if invite.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite has expired")

    if invite.email != current_user.email:
        raise HTTPException(status_code=403, detail="This invite was sent to a different email address")

    # Add user to organization
    new_member = OrganizationMember(
        organization_id=invite.organization_id,
        user_id=current_user.id,
        role=invite.role,
        invited_by=invite.invited_by,
    )
    db.add(new_member)

    invite.accepted_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Invite accepted successfully"}


@router.delete("/members/{user_id}")
@limiter.limit("10/minute")
async def remove_member(
    request: Request,
    user_id: uuid.UUID,
    membership: OrgMembership,
    current_user: CurrentRecruiter,
    db: DbSession,
) -> Any:
    """Remove a team member from the organization. Requires admin+ role."""
    member, org = membership
    _assert_min_role(member.role, OrgRole.ADMIN.value)

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    target = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org.id,
            OrganizationMember.user_id == user_id,
        )
    )
    target_member = target.scalars().first()

    if not target_member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Can't remove someone with a higher or equal role
    if ROLE_HIERARCHY.get(target_member.role, 0) >= ROLE_HIERARCHY.get(member.role, 0):
        raise HTTPException(status_code=403, detail="Cannot remove a member with equal or higher role")

    await db.delete(target_member)
    await db.commit()

    return {"message": "Member removed successfully"}


@router.patch("/members/{user_id}/role")
@limiter.limit("10/minute")
async def update_member_role(
    request: Request,
    user_id: uuid.UUID,
    data: UpdateMemberRoleRequest,
    membership: OrgMembership,
    current_user: CurrentRecruiter,
    db: DbSession,
) -> Any:
    """Change a team member's role. Requires owner role."""
    member, org = membership
    _assert_min_role(member.role, OrgRole.OWNER.value)

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    if data.role not in [r.value for r in OrgRole]:
        raise HTTPException(status_code=400, detail="Invalid role")

    target = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org.id,
            OrganizationMember.user_id == user_id,
        )
    )
    target_member = target.scalars().first()

    if not target_member:
        raise HTTPException(status_code=404, detail="Member not found")

    target_member.role = data.role
    await db.commit()

    return {"message": f"Role updated to {data.role}"}


@router.get("/invites", response_model=list[InviteResponse])
@limiter.limit("30/minute")
async def list_invites(
    request: Request,
    membership: OrgMembership,
    db: DbSession,
) -> Any:
    """List all pending invitations. Requires admin+ role."""
    member, org = membership
    _assert_min_role(member.role, OrgRole.ADMIN.value)

    result = await db.execute(
        select(OrganizationInvite)
        .where(
            OrganizationInvite.organization_id == org.id,
            OrganizationInvite.accepted_at.is_(None),
        )
        .order_by(OrganizationInvite.created_at.desc())
    )
    return result.scalars().all()
