"""
Health check endpoint.
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    service: str
    version: str
    timestamp: str


from sqlalchemy import text
from app.api.deps import DbSession
from fastapi import APIRouter, Depends, status, HTTPException
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check(db: DbSession) -> HealthResponse:
    """Check service health and database connectivity."""
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "error"
        # We still return 200 but flag the DB as down, or we could return 503
        
    return HealthResponse(
        status="healthy" if db_status == "ok" else "degraded",
        service="InterviewOS API",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
