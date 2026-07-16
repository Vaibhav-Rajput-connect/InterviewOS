"""
API v1 router — aggregates all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.resume import router as resume_router
from app.api.v1.endpoints.coach import router as coach_router
from app.api.v1.endpoints.interview import router as interview_router
from app.api.v1.endpoints.coding import router as coding_router
from app.api.v1.endpoints.coding_admin import router as coding_admin_router
from app.api.v1.endpoints.coding_collab import router as coding_collab_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.recruiter_auth import router as recruiter_auth_router
from app.api.v1.endpoints.recruiter_org import router as recruiter_org_router
from app.api.v1.endpoints.recruiter_eval import router as recruiter_eval_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, tags=["Health"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(resume_router, prefix="/resume", tags=["Resume"])
api_v1_router.include_router(coach_router, prefix="/coach", tags=["Coach"])
api_v1_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(interview_router, prefix="/interview", tags=["Interview"])
api_v1_router.include_router(coding_router, prefix="/coding", tags=["Coding"])
api_v1_router.include_router(coding_admin_router, prefix="/coding/admin", tags=["Coding Admin"])
api_v1_router.include_router(coding_collab_router, prefix="/coding/collab", tags=["Coding Collab"])
api_v1_router.include_router(recruiter_auth_router, prefix="/recruiter", tags=["Recruiter Auth"])
api_v1_router.include_router(recruiter_org_router, prefix="/recruiter/org", tags=["Recruiter Org"])
api_v1_router.include_router(recruiter_eval_router, prefix="/recruiter/eval", tags=["Recruiter Eval"])

