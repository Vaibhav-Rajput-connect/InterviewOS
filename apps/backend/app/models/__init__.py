"""
Models package — import all models to register them with SQLAlchemy.
"""

from .user import User
from .profile import Profile
from .resume import (
    Resume,
    ResumeAnalysis,
    ResumeSection,
    ResumeSkill,
    ResumeExperience,
    ResumeEducation,
    ResumeProject,
    Technology,
    Embedding,
)
from .interview import Interview
from .question import Question
from .answer import Answer
from .auth import Session, VerificationToken
from .activity import ActivityLog, Notification
from .gamification import Achievement, DailyGoal, UserStats

__all__ = [
    "User",
    "Profile",
    "Resume",
    "Interview",
    "Question",
    "Answer",
    "Session",
    "VerificationToken",
    "ActivityLog",
    "Notification",
    "Achievement",
    "DailyGoal",
    "UserStats",
    "ResumeAnalysis",
    "ResumeSection",
    "ResumeSkill",
    "ResumeExperience",
    "ResumeEducation",
    "ResumeProject",
    "Technology",
    "Embedding",
]
