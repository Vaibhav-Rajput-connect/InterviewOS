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


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check service health."""
    return HealthResponse(
        status="healthy",
        service="InterviewOS API",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
