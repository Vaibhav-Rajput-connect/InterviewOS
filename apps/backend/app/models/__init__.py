"""
Models package — import all models to register them with SQLAlchemy.
"""

from app.models.user import User
from app.models.resume import Resume
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer

__all__ = ["User", "Resume", "Interview", "Question", "Answer"]
