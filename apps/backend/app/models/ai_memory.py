"""
AI Memory System models.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.db.base import Base


class AIMemory(Base):
    """
    Stores diverse contextual data for the AI Coach.
    """
    __tablename__ = "ai_memories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # E.g., 'resume', 'interview', 'coding', 'mistake', 'topic', 'goal', 'preference', 'conversation'
    memory_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # The actual text representation of the memory
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Optional structured metadata (e.g., {"score": 85, "difficulty": "Hard"})
    meta_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Semantic embedding vector for retrieval
    embedding: Mapped[list[float]] = mapped_column(Vector(768), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        # HNSW Index for ultra-fast vector similarity search
        Index(
            "hnsw_index",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="ai_memories")

    def __repr__(self) -> str:
        return f"<AIMemory {self.memory_type} for User {self.user_id}>"
