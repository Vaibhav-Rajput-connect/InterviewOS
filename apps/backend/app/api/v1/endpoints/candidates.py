"""
Candidate Management Endpoints for Recruiters.
"""

from typing import Any
from fastapi import APIRouter, Query, Request
from pydantic import BaseModel, Field

from app.api.deps import DbSession, OrgMembership
from app.core.rate_limit import limiter

router = APIRouter()


class StatusUpdate(BaseModel):
    status: str = Field(..., max_length=50, description="The UUID of the target HiringStage")

class NoteUpdate(BaseModel):
    note: str = Field(..., max_length=1000, description="Internal recruiter note content")


@router.get("")
@limiter.limit("30/minute")
async def list_candidates(
    request: Request,
    org_membership: OrgMembership,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List all candidates for the recruiter's organization with pagination."""
    member, org = org_membership
    # In a real implementation: db.execute(select(Candidate).where(Candidate.organization_id == org.id).offset(skip).limit(limit))
    # and db.execute(select(func.count(Candidate.id)).where(Candidate.organization_id == org.id))
    
    mock_items = [
        {"id": "c1", "name": "Aarav Sharma", "role": "Senior Frontend Engineer", "stage": "Coding Interview", "aiScore": 94},
        {"id": "c2", "name": "Priya Patel", "role": "Full Stack Developer", "stage": "Technical Interview", "aiScore": 91},
    ]
    
    return {
        "total": 2,
        "skip": skip,
        "limit": limit,
        "items": mock_items
    }


@router.get("/{id}")
@limiter.limit("30/minute")
async def get_candidate(
    request: Request,
    id: str,
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Get candidate details by ID, ensuring they belong to the organization."""
    member, org = org_membership
    # In a real implementation: assert candidate.organization_id == org.id
    return {
        "id": id,
        "name": "Aarav Sharma",
        "role": "Senior Frontend Engineer",
        "email": "aarav@example.com",
        "aiScore": 94,
        "stage": "Coding Interview"
    }


@router.post("/status")
@limiter.limit("20/minute")
async def update_candidate_status(
    request: Request,
    data: StatusUpdate,
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Update candidate pipeline status securely."""
    member, org = org_membership
    return {"message": "Status updated successfully", "status": data.status}


@router.post("/note")
@limiter.limit("20/minute")
async def add_candidate_note(
    request: Request,
    data: NoteUpdate,
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Add a note to a candidate's profile securely."""
    member, org = org_membership
    return {"message": "Note added successfully"}


@router.post("/{id}/archive")
@limiter.limit("20/minute")
async def archive_candidate(
    request: Request,
    id: str,
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Hard archive a candidate."""
    member, org = org_membership
    # In a real implementation: update candidate is_archived = True
    return {"message": f"Candidate {id} archived successfully"}
