from sqlalchemy import Column, String, Text, Integer, JSON, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

from app.db.base import Base

class ProblemTag(Base):
    __tablename__ = "problem_tags"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    problem = relationship("CodingProblem", back_populates="tags")


class ProblemCompany(Base):
    __tablename__ = "problem_companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    problem = relationship("CodingProblem", back_populates="companies")


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    difficulty = Column(String(50), nullable=False)  # Easy, Medium, Hard
    description = Column(Text, nullable=False)
    constraints = Column(JSON, nullable=True)  # List of constraint strings
    examples = Column(JSON, nullable=True)  # List of dicts {input, output, explanation}
    test_cases = Column(JSON, nullable=True) # List of dicts {input, expected, is_hidden}
    
    # Optional setup code (e.g. initial boilerplate for JS, Python, etc.)
    boilerplate = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user_statuses = relationship("UserProblemStatus", back_populates="problem", cascade="all, delete-orphan")
    tags = relationship("ProblemTag", back_populates="problem", cascade="all, delete-orphan")
    companies = relationship("ProblemCompany", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="problem", cascade="all, delete-orphan")
    hints = relationship("CodingHint", back_populates="problem", cascade="all, delete-orphan")


class UserProblemStatus(Base):
    __tablename__ = "user_problem_statuses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(String(50), default="untouched")  # untouched, attempted, solved
    bookmarked = Column(Boolean, default=False)
    
    last_attempted_at = Column(DateTime(timezone=True), nullable=True)
    solved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="problem_statuses")
    problem = relationship("CodingProblem", back_populates="user_statuses")


class SubmissionResult(Base):
    __tablename__ = "submission_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("coding_submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    correctness_score = Column(Integer, nullable=True)
    code_quality_score = Column(Integer, nullable=True)
    time_complexity = Column(String(100), nullable=True)
    space_complexity = Column(String(100), nullable=True)
    readability_feedback = Column(Text, nullable=True)
    best_practices_feedback = Column(Text, nullable=True)
    edge_case_feedback = Column(Text, nullable=True)
    optimization_suggestions = Column(Text, nullable=True)
    
    submission = relationship("CodingSubmission", back_populates="evaluation_result")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("coding_submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    exit_code = Column(Integer, nullable=True)
    time_ms = Column(Integer, nullable=True)
    memory_kb = Column(Integer, nullable=True)
    pass_count = Column(Integer, nullable=True)
    fail_count = Column(Integer, nullable=True)
    total_cases = Column(Integer, nullable=True)
    status = Column(String(100), nullable=True)
    
    submission = relationship("CodingSubmission", back_populates="execution_log")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")  # pending, success, failed, error
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="coding_submissions")
    problem = relationship("CodingProblem", back_populates="submissions")
    evaluation_result = relationship("SubmissionResult", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    execution_log = relationship("ExecutionLog", back_populates="submission", uselist=False, cascade="all, delete-orphan")


class CodingHint(Base):
    __tablename__ = "coding_hints"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    code_snapshot = Column(Text, nullable=True)
    hint_text = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", backref="coding_hints")
    problem = relationship("CodingProblem", back_populates="hints")
