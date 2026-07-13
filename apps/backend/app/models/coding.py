from sqlalchemy import Column, String, Text, Integer, JSON, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

from app.db.base import Base

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
    companies = Column(JSON, nullable=True)  # List of company names
    topics = Column(JSON, nullable=True)  # List of topic strings
    
    # Optional setup code (e.g. initial boilerplate for JS, Python, etc.)
    boilerplate = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user_statuses = relationship("UserProblemStatus", back_populates="problem", cascade="all, delete-orphan")


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
