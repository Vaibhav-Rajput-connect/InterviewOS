"""
Async SQLAlchemy engine and session management.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine_kwargs = {
    "echo": settings.is_development,
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
}

if "neon.tech" in str(settings.DATABASE_URL):
    engine_kwargs["connect_args"] = {"ssl": "require"}

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
