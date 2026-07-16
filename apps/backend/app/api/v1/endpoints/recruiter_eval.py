import json
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

from app.api.deps import CurrentRecruiter, OrgMembership
from app.core.rate_limit import limiter
from app.services.ai.gateway import AIGateway
from app.services.ai.schemas import CandidateEvaluationResult

router = APIRouter()
ai_gateway = AIGateway()

class CandidateEvalRequest(BaseModel):
    candidate_data: str

@router.post("/evaluate", response_model=CandidateEvaluationResult)
@limiter.limit("10/minute")
async def evaluate_candidate(
    request: Request,
    data: CandidateEvalRequest,
    current_user: CurrentRecruiter,
    membership: OrgMembership,
) -> Any:
    """
    Run the AI Gateway to evaluate a candidate based on aggregated data.
    Requires recruiter or org_admin role.
    """
    try:
        result = await ai_gateway.evaluate_candidate(candidate_data=data.candidate_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")
