"""
Recruiter Dashboard Endpoints.
"""

from typing import Any
from fastapi import APIRouter

from app.api.deps import DbSession, OrgMembership
from app.core.rate_limit import limiter

router = APIRouter()


@router.get("")
@limiter.limit("30/minute")
async def get_dashboard(
    org_membership: OrgMembership,
    db: DbSession,
) -> Any:
    """Get high-level statistics for the recruiter dashboard, isolated by organization."""
    member, org = org_membership
    # In a real implementation: query stats grouped by org.id
    return {
        "stats": {
            "activeCandidates": 124,
            "interviewsThisWeek": 32,
            "avgScore": 86,
            "offersAccepted": 12
        },
        "systemStatus": {
            "status": "Operational",
            "uptime": "99.9%",
            "apiLatency": "42ms"
        }
    }
