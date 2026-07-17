"""
AI Evaluation Engine API endpoints.
"""

import uuid
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status, Request
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.rate_limit import limiter
from app.services.ai.evaluation_engine import EvaluationEngineService
from app.models.full_evaluation import FullEvaluation

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate/{session_id}", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def generate_evaluation(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Generate a comprehensive AI evaluation for a completed interview session.
    Evaluates across 7 dimensions: Technical, Coding, Communication, Confidence,
    Problem Solving, System Design, and Behavioral.
    """
    # Check if evaluation already exists
    stmt = (
        select(FullEvaluation)
        .where(FullEvaluation.session_id == session_id)
        .where(FullEvaluation.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evaluation already exists for this session. Use GET to retrieve it."
        )

    try:
        service = EvaluationEngineService()
        evaluation = await service.generate_full_evaluation(db, session_id, current_user.id)

        return {
            "id": str(evaluation.id),
            "session_id": str(evaluation.session_id),
            "overall_score": evaluation.overall_score,
            "technical_score": evaluation.technical_score,
            "coding_score": evaluation.coding_score,
            "communication_score": evaluation.communication_score,
            "confidence_score": evaluation.confidence_score,
            "problem_solving_score": evaluation.problem_solving_score,
            "system_design_score": evaluation.system_design_score,
            "behavioral_score": evaluation.behavioral_score,
            "detailed_feedback": evaluation.detailed_feedback,
            "strengths": evaluation.strengths,
            "weaknesses": evaluation.weaknesses,
            "improvement_suggestions": evaluation.improvement_suggestions,
            "learning_recommendations": evaluation.learning_recommendations,
            "created_at": evaluation.created_at.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Evaluation generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate evaluation. Please try again."
        )


@router.get("/{session_id}")
@limiter.limit("30/minute")
async def get_evaluation(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Retrieve the comprehensive evaluation for an interview session."""
    service = EvaluationEngineService()
    evaluation = await service.get_evaluation(db, session_id, current_user.id)

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No evaluation found for this session."
        )

    return {
        "id": str(evaluation.id),
        "session_id": str(evaluation.session_id),
        "overall_score": evaluation.overall_score,
        "technical_score": evaluation.technical_score,
        "coding_score": evaluation.coding_score,
        "communication_score": evaluation.communication_score,
        "confidence_score": evaluation.confidence_score,
        "problem_solving_score": evaluation.problem_solving_score,
        "system_design_score": evaluation.system_design_score,
        "behavioral_score": evaluation.behavioral_score,
        "detailed_feedback": evaluation.detailed_feedback,
        "strengths": evaluation.strengths,
        "weaknesses": evaluation.weaknesses,
        "improvement_suggestions": evaluation.improvement_suggestions,
        "learning_recommendations": evaluation.learning_recommendations,
        "created_at": evaluation.created_at.isoformat(),
    }
