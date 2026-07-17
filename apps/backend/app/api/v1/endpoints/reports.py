import uuid
import logging
from typing import Any
from fastapi import APIRouter, Request, HTTPException, status
from sqlalchemy import select

from app.api.deps import DbSession, CurrentUser
from app.core.rate_limit import limiter
from app.services.report_generator import ReportGeneratorService
from app.models.recruiting import InterviewReport

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate/{session_id}", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def generate_report(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Generate a comprehensive interview report from session data."""
    # Check if report already exists
    stmt = select(InterviewReport).where(InterviewReport.session_id == session_id)
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        return existing.content

    try:
        service = ReportGeneratorService()
        report_data = await service.generate_report(db, session_id, current_user.id)

        # In a real app we might link this to a specific candidate/pipeline.
        # For now, we store it attached to the session ID.
        report = InterviewReport(
            candidate_id=current_user.id, # Using current user as candidate for self-prep mode
            session_id=session_id,
            content=report_data,
            overall_score=report_data.get("ai_evaluation", {}).get("overall_score"),
            recommendation=report_data.get("hiring_recommendation", {}).get("recommendation")
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)

        return report_data
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report. Please try again."
        )


@router.get("/{session_id}")
@limiter.limit("30/minute")
async def get_report(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Get the full interview report for a session."""
    stmt = select(InterviewReport).where(InterviewReport.session_id == session_id)
    result = await db.execute(stmt)
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return report.content
