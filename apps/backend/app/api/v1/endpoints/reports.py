"""
Interview Reports Endpoints.
"""

from typing import Any
from fastapi import APIRouter

from app.api.deps import DbSession, OrgMembership
from app.core.rate_limit import limiter

router = APIRouter()


@router.get("/{id}")
@limiter.limit("30/minute")
async def get_report(
    id: str,
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Get the full interview report for a candidate, scoped to the recruiter's organization."""
    member, org = org_membership
    # In a real implementation: assert report.organization_id == org.id
    return {
        "id": id,
        "candidate_id": "c1",
        "overall_score": 94,
        "recommendation": "Strong Hire",
        "summary": "Candidate demonstrated exceptional proficiency...",
        "ai_feedback": "The candidate showed a very structured approach...",
        "strengths": ["Deep understanding", "Strong intuition"],
        "weaknesses": ["Could optimize edge-case handling"]
    }
