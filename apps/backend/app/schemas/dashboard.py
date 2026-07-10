from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class UserStatsResponse(BaseModel):
    level: int
    xp: int
    interview_streak: int
    readiness_score: float
    coding_progress: float

class ActivityLogResponse(BaseModel):
    id: str
    action: str
    details: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DailyGoalResponse(BaseModel):
    id: str
    goal_type: str
    description: str
    target: int
    progress: int
    is_completed: bool
    date: date

    class Config:
        from_attributes = True

class DashboardOverviewResponse(BaseModel):
    stats: UserStatsResponse
    recent_activity: List[ActivityLogResponse]
    goals: List[DailyGoalResponse]
