from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True) # Icon name or URL
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="achievements")

class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_type = Column(String, nullable=False) # e.g., "SOLVE_PROBLEM", "MOCK_INTERVIEW"
    description = Column(String, nullable=False)
    target = Column(Integer, default=1)
    progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    date = Column(Date, default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="daily_goals")

class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    interview_streak = Column(Integer, default=0)
    readiness_score = Column(Float, default=0.0) # 0 to 100
    coding_progress = Column(Float, default=0.0) # 0 to 100
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="stats", uselist=False)
