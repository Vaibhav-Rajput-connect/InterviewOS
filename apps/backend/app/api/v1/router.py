"""
API v1 router — aggregates all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.resume import router as resume_router
from app.api.v1.endpoints.coach import router as coach_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, tags=["health"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_v1_router.include_router(resume_router, prefix="/resume", tags=["resume"])
api_v1_router.include_router(coach_router, prefix="/coach", tags=["coach"])
