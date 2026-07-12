"""
InterviewOS Backend — FastAPI Application Factory
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

import uuid
from starlette.requests import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging, request_id_var
from app.core.rate_limit import limiter
from app.api.v1.router import api_v1_router
from app.db.engine import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events."""
    setup_logging()

    # Startup
    # In production, use Alembic migrations instead
    # from app.db.base import Base
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    tags_metadata = [
        {"name": "Auth", "description": "Authentication and user identity endpoints."},
        {"name": "Resume", "description": "Resume upload, processing, and parsing pipelines."},
        {"name": "AI Gateway", "description": "Core AI OS processing endpoints."},
    ]

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="The AI Operating System for Interview Success. Complete API Documentation for InterviewOS.",
        version="0.1.0",
        openapi_tags=tags_metadata,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
        lifespan=lifespan,
    )
    
    app.state.limiter = limiter
    from typing import cast, Callable, Any
    app.add_exception_handler(RateLimitExceeded, cast(Callable[..., Any], _rate_limit_exceeded_handler))

    @app.middleware("http")
    async def add_request_id_middleware(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # CORS — restrict methods to only those we actually use
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Session Middleware (Required for Authlib OAuth)
    app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

    # API Routes
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()
