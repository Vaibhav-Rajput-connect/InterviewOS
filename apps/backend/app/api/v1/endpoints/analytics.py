from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Any
import random
from datetime import datetime, timedelta

from app.api.deps import CurrentUser, DbSession, OrgMembership
from app.core.cache import async_ttl_cache
from app.core.rate_limit import limiter

router = APIRouter()

@router.get("/recruiter")
@limiter.limit("30/minute")
@async_ttl_cache(ttl=300)
async def get_recruiter_analytics(
    request: Request,
    org_membership: OrgMembership,
) -> Any:
    """Returns analytics data for the Recruiter Command Center, scoped by organization."""
    member, org = org_membership
    # In a real implementation: filter metrics by org.id
    return {
        "trends": [
            {"month": "Jan", "applications": 400, "offers": 24, "hires": 18},
            {"month": "Feb", "applications": 300, "offers": 18, "hires": 12},
            {"month": "Mar", "applications": 550, "offers": 35, "hires": 25},
            {"month": "Apr", "applications": 480, "offers": 28, "hires": 20},
            {"month": "May", "applications": 600, "offers": 42, "hires": 30},
            {"month": "Jun", "applications": 750, "offers": 55, "hires": 42},
        ],
        "funnel": [
            {"stage": "Sourced", "count": 1000},
            {"stage": "Applied", "count": 750},
            {"stage": "Screened", "count": 400},
            {"stage": "Interviewed", "count": 150},
            {"stage": "Offered", "count": 45},
            {"stage": "Hired", "count": 32},
        ],
        "skills": [
            {"subject": "React/Next.js", "score": 85},
            {"subject": "System Design", "score": 65},
            {"subject": "Algorithms", "score": 70},
            {"subject": "Communication", "score": 90},
            {"subject": "Cloud/DevOps", "score": 55},
            {"subject": "Databases", "score": 75},
        ],
        "departments": [
            {"name": "Engineering", "active": 45, "hired": 120},
            {"name": "Product", "active": 15, "hired": 45},
            {"name": "Design", "active": 8, "hired": 30},
            {"name": "Marketing", "active": 12, "hired": 40},
            {"name": "Sales", "active": 25, "hired": 85},
        ]
    }

@router.get("")
@limiter.limit("30/minute")
@async_ttl_cache(ttl=300)
async def get_dashboard_metrics(
    request: Request,
    current_user: CurrentUser,
) -> Any:
    """
    Returns aggregated metrics for the Analytics Dashboard.
    """
    # Generate mock dates for the last 7 days
    dates = [(datetime.now() - timedelta(days=i)).strftime("%b %d") for i in range(6, -1, -1)]
    
    resume_trend = [
        {"date": dates[0], "score": 65},
        {"date": dates[1], "score": 68},
        {"date": dates[2], "score": 72},
        {"date": dates[3], "score": 72},
        {"date": dates[4], "score": 85},
        {"date": dates[5], "score": 88},
        {"date": dates[6], "score": 92},
    ]
    
    coding_accuracy = [
        {"date": dates[0], "accuracy": 45, "problems_solved": 2},
        {"date": dates[1], "accuracy": 50, "problems_solved": 3},
        {"date": dates[2], "accuracy": 55, "problems_solved": 2},
        {"date": dates[3], "accuracy": 65, "problems_solved": 5},
        {"date": dates[4], "accuracy": 70, "problems_solved": 4},
        {"date": dates[5], "accuracy": 82, "problems_solved": 6},
        {"date": dates[6], "accuracy": 85, "problems_solved": 3},
    ]
    
    skill_distribution = [
        {"subject": "Algorithms", "score": 85, "fullMark": 100},
        {"subject": "System Design", "score": 65, "fullMark": 100},
        {"subject": "Behavioral", "score": 90, "fullMark": 100},
        {"subject": "Data Structures", "score": 75, "fullMark": 100},
        {"subject": "Databases", "score": 60, "fullMark": 100},
        {"subject": "Communication", "score": 95, "fullMark": 100},
    ]
    
    # Generate 60 days of heatmap data
    activity_heatmap = []
    base_date = datetime.now() - timedelta(days=60)
    for i in range(60):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        count = random.choice([0, 0, 0, 1, 1, 2, 3, 5])
        # Make the last few days more active
        if i > 50:
            count = random.choice([1, 2, 4, 6])
        activity_heatmap.append({"date": date_str, "count": count})
        
    return {
        "interview_readiness": 78,
        "consistency_streak": 12,
        "total_problems": 45,
        "resume_trend": resume_trend,
        "coding_accuracy": coding_accuracy,
        "skill_distribution": skill_distribution,
        "activity_heatmap": activity_heatmap
    }

@router.get("/trends")
@limiter.limit("30/minute")
@async_ttl_cache(ttl=300)
async def get_analytics_trends(
    request: Request,
    current_user: CurrentUser,
) -> Any:
    """
    Returns week-over-week trends.
    """
    return {
        "resume_growth": "+12%",
        "coding_accuracy_growth": "+8%",
        "system_design_growth": "+22%"
    }
