"""
Database models for the Recruiter Command Center & Hiring Pipeline.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Team(Base):
    """Specialized hiring units within an Organization."""
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    pipelines: Mapped[list["Pipeline"]] = relationship(back_populates="team", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Team {self.name}>"


class Pipeline(Base):
    """A specific hiring workflow (e.g., Senior Software Engineer)."""
    __tablename__ = "pipelines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    team: Mapped[Optional["Team"]] = relationship(back_populates="pipelines")
    stages: Mapped[list["HiringStage"]] = relationship(back_populates="pipeline", cascade="all, delete-orphan", order_by="HiringStage.order")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="pipeline", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Pipeline {self.title}>"


class HiringStage(Base):
    """Individual columns/stages in a Pipeline."""
    __tablename__ = "hiring_stages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pipeline_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pipelines.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    pipeline: Mapped["Pipeline"] = relationship(back_populates="stages")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="current_stage")

    def __repr__(self) -> str:
        return f"<HiringStage {self.name} (Order: {self.order})>"


class Candidate(Base):
    """Links a user to a specific pipeline and tracks their stage."""
    __tablename__ = "candidates"
    __table_args__ = (
        UniqueConstraint("pipeline_id", "user_id", name="uq_pipeline_candidate"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pipeline_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pipelines.id", ondelete="CASCADE"), nullable=False, index=True)
    current_stage_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hiring_stages.id", ondelete="RESTRICT"), nullable=False)
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    pipeline: Mapped["Pipeline"] = relationship(back_populates="candidates")
    current_stage: Mapped["HiringStage"] = relationship(back_populates="candidates")
    notes: Mapped[list["CandidateNote"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", order_by="CandidateNote.created_at.desc()")
    reports: Mapped[list["InterviewReport"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Candidate user={self.user_id} pipeline={self.pipeline_id}>"


class CandidateNote(Base):
    """Internal notes left by recruiters on a candidate's profile."""
    __tablename__ = "candidate_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    candidate: Mapped["Candidate"] = relationship(back_populates="notes")

    def __repr__(self) -> str:
        return f"<CandidateNote id={self.id}>"


class InterviewReport(Base):
    """Aggregated AI evaluation for a specific interview round."""
    __tablename__ = "interview_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hiring_stages.id", ondelete="CASCADE"), nullable=False)
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendation: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    candidate: Mapped["Candidate"] = relationship(back_populates="reports")
    evaluations: Mapped[list["Evaluation"]] = relationship(back_populates="report", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<InterviewReport score={self.overall_score} rec={self.recommendation}>"


class Evaluation(Base):
    """Granular, dimensional scoring attached to a report."""
    __tablename__ = "evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interview_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    report: Mapped["InterviewReport"] = relationship(back_populates="evaluations")

    def __repr__(self) -> str:
        return f"<Evaluation category={self.category} score={self.score}>"
