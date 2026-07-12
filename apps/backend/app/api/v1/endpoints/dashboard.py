from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from typing import List

from app.api.deps import CurrentUser, DbSession
from app.models.activity import ActivityLog, Notification
from app.models.gamification import DailyGoal, UserStats
from app.schemas.dashboard import (
    UserStatsResponse,
    ActivityLogResponse,
    NotificationResponse,
    DailyGoalResponse,
    DashboardOverviewResponse,
)

router = APIRouter()

@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Get a complete overview of the user's dashboard stats, goals, and recent activity.
    """
    # 1. Get or create UserStats
    stats_query = await db.execute(select(UserStats).where(UserStats.user_id == current_user.id))
    stats = stats_query.scalar_one_or_none()
    if not stats:
        stats = UserStats(
            user_id=current_user.id,
            level=1,
            xp=0,
            interview_streak=0,
            readiness_score=0.0,
            coding_progress=0.0
        )
        db.add(stats)
        await db.commit()
        await db.refresh(stats)

    # 2. Get recent Activity
    activity_query = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
    )
    activities = activity_query.scalars().all()

    # 3. Get Daily Goals
    goals_query = await db.execute(
        select(DailyGoal)
        .where(DailyGoal.user_id == current_user.id)
        .order_by(DailyGoal.created_at.desc())
        .limit(5)
    )
    goals = goals_query.scalars().all()

    return DashboardOverviewResponse(
        stats=stats, # type: ignore
        recent_activity=list(activities), # type: ignore
        goals=list(goals), # type: ignore
    )

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Get user notifications.
    """
    query = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    return query.scalars().all()

@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Mark a notification as read.
    """
    query = await db.execute(
        select(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    notification = query.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
    notification.is_read = True # type: ignore
    await db.commit()
    await db.refresh(notification)
    return notification
