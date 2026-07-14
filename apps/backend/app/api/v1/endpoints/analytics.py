from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Any
import random
from datetime import datetime, timedelta

from app.api.deps import CurrentUser, DbSession
from app.core.cache import async_ttl_cache
from app.core.rate_limit import limiter

router = APIRouter()

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
