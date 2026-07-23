"""
InterviewOS Backend — FastAPI Application Factory
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

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

    import os
    is_production = settings.ENVIRONMENT != "development" or os.getenv("RENDER") is not None

    # Startup
    # Secret Key Validation
    if is_production and settings.SECRET_KEY == "CHANGE-ME-IN-PRODUCTION":
        raise RuntimeError("FATAL SECURITY ERROR: SECRET_KEY is not set for production!")

    # Auto-seed coding problems if the table is empty
    try:
        from app.db.engine import async_session_factory
        from app.models.coding import CodingProblem, ProblemTag, ProblemCompany
        from sqlalchemy import select, func
        import json
        import pathlib
        import logging

        logger = logging.getLogger(__name__)

        async with async_session_factory() as db:
            result = await db.execute(select(func.count(CodingProblem.id)))
            count = result.scalar() or 0

            if count == 0:
                logger.info("No coding problems found. Auto-seeding...")
                json_path = pathlib.Path(__file__).resolve().parent.parent / "generated_problems.json"
                if json_path.exists():
                    with open(json_path, "r") as f:
                        problems_data = json.load(f)

                    db_problems = []
                    for p_data in problems_data:
                        p = CodingProblem(
                            title=p_data["title"],
                            slug=p_data["slug"],
                            difficulty=p_data["difficulty"],
                            description=p_data["description"],
                            constraints=p_data.get("constraints"),
                            examples=p_data.get("examples"),
                            test_cases=p_data.get("test_cases"),
                            boilerplate=p_data.get("boilerplate"),
                        )
                        db_problems.append(p)

                    db.add_all(db_problems)
                    await db.flush()

                    all_tags = []
                    all_companies = []
                    for idx, p_data in enumerate(problems_data):
                        p_id = db_problems[idx].id
                        for t in p_data.get("tags", []):
                            all_tags.append(ProblemTag(problem_id=p_id, name=t))
                        for c in p_data.get("companies", []):
                            all_companies.append(ProblemCompany(problem_id=p_id, name=c))

                    db.add_all(all_tags)
                    db.add_all(all_companies)
                    await db.commit()
                    logger.info(f"Successfully seeded {len(db_problems)} coding problems.")
                else:
                    logger.warning(f"generated_problems.json not found at {json_path}")
            else:
                logger.info(f"Coding problems already seeded ({count} found). Skipping.")
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to auto-seed coding problems: {e}")

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
    # pyrefly: ignore [bad-argument-type]
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        import traceback
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Global Exception: {exc}", exc_info=True)
        from fastapi.responses import JSONResponse
        
        if settings.ENVIRONMENT != "development":
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error"}
            )
            
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(exc)}", "type": str(type(exc))}
        )

    @app.middleware("http")
    async def add_request_id_middleware(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    import os
    is_production = settings.ENVIRONMENT != "development" or os.getenv("RENDER") is not None

    # CORS — restrict methods to only those we actually use
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )

    # Session Middleware (Required for Authlib OAuth)
    app.add_middleware(
        SessionMiddleware, 
        secret_key=settings.SECRET_KEY,
        same_site="lax" if not is_production else "none",
        https_only=False if not is_production else True,
    )

    # Proxy Headers Middleware (fixes HTTP -> HTTPS redirect URI mismatch behind Render)
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

    # API Routes
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()
