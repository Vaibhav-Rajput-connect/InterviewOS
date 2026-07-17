"""
Full Evaluation model — stores comprehensive interview evaluations.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Float, Integer, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class FullEvaluation(Base):
    __tablename__ = "full_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Dimension scores
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    technical_score: Mapped[int] = mapped_column(Integer, nullable=False)
    coding_score: Mapped[int] = mapped_column(Integer, nullable=False)
    communication_score: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
    problem_solving_score: Mapped[int] = mapped_column(Integer, nullable=False)
    system_design_score: Mapped[int] = mapped_column(Integer, nullable=False)
    behavioral_score: Mapped[int] = mapped_column(Integer, nullable=False)

    # Qualitative feedback
    detailed_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    improvement_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    learning_recommendations: Mapped[list | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session: Mapped["InterviewSession"] = relationship()
    user: Mapped["User"] = relationship()

    def __repr__(self) -> str:
        return f"<FullEvaluation session={self.session_id} score={self.overall_score}>"
