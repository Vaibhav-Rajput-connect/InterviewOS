from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
import uuid

from pydantic import BaseModel
from typing import Optional, List, Dict

from app.api import deps
from app.models import User
from app.models.coding import CodingProblem, UserProblemStatus
from app.services.coding.runner import CodeRunner

class ExecutionRequest(BaseModel):
    language: str
    code: str
    problem_id: Optional[str] = None

class ExecutionResult(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    time_ms: int
    memory_kb: Optional[int] = None
    status: str
    test_results: Optional[List[Dict]] = []
    passed_count: Optional[int] = 0
    failed_count: Optional[int] = 0

router = APIRouter()


@router.get("/problems")
async def get_problems(
    db: deps.DbSession,
    current_user: deps.CurrentUser,
    difficulty: str = None,
    topic: str = None,
    search: str = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
) -> Any:
    """
    Retrieve coding problems with optional filtering and search.
    """
    query = select(CodingProblem)
    
    if difficulty:
        query = query.filter(CodingProblem.difficulty == difficulty)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CodingProblem.title.ilike(search_term),
                CodingProblem.description.ilike(search_term)
            )
        )
    # Note: For JSON array filtering like 'topic' in 'topics', SQLAlchemy postgres dialect allows contains/has
    # For simplicity, we skip complex JSON array filtering here unless needed.

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    problems = result.scalars().all()
    
    # Also fetch the user's statuses for these problems
    problem_ids = [p.id for p in problems]
    status_query = select(UserProblemStatus).filter(
        UserProblemStatus.user_id == current_user.id,
        UserProblemStatus.problem_id.in_(problem_ids)
    )
    status_result = await db.execute(status_query)
    statuses = {s.problem_id: s for s in status_result.scalars().all()}
    
    response = []
    for p in problems:
        status = statuses.get(p.id)
        response.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "difficulty": p.difficulty,
            "topics": p.topics,
            "companies": p.companies,
            "status": status.status if status else "untouched",
            "bookmarked": status.bookmarked if status else False,
        })
        
    return response

@router.get("/problems/{id}")
async def get_problem(
    id: uuid.UUID,
    db: deps.DbSession,
    current_user: deps.CurrentUser,
) -> Any:
    """
    Get a specific coding problem by ID.
    """
    problem = await db.get(CodingProblem, id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    status_query = select(UserProblemStatus).filter(
        UserProblemStatus.user_id == current_user.id,
        UserProblemStatus.problem_id == problem.id
    )
    result = await db.execute(status_query)
    status = result.scalar_one_or_none()
    
    return {
        "id": problem.id,
        "title": problem.title,
        "slug": problem.slug,
        "difficulty": problem.difficulty,
        "description": problem.description,
        "constraints": problem.constraints,
        "examples": problem.examples,
        "companies": problem.companies,
        "topics": problem.topics,
        "boilerplate": problem.boilerplate,
        "status": status.status if status else "untouched",
        "bookmarked": status.bookmarked if status else False,
    }

@router.post("/problems/{id}/bookmark")
async def toggle_bookmark(
    id: uuid.UUID,
    db: deps.DbSession,
    current_user: deps.CurrentUser,
) -> Any:
    """
    Toggle the bookmark status of a problem.
    """
    problem = await db.get(CodingProblem, id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    status_query = select(UserProblemStatus).filter(
        UserProblemStatus.user_id == current_user.id,
        UserProblemStatus.problem_id == problem.id
    )
    result = await db.execute(status_query)
    status = result.scalar_one_or_none()
    
    if status:
        status.bookmarked = not status.bookmarked
    else:
        status = UserProblemStatus(
            user_id=current_user.id,
            problem_id=problem.id,
            bookmarked=True
        )
        db.add(status)
        
    await db.commit()
    
    return {"bookmarked": status.bookmarked}

@router.post("/execute", response_model=ExecutionResult)
async def execute_code(
    request: ExecutionRequest,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    """
    Execute code in a sandboxed environment.
    """
    test_cases = None
    if request.problem_id:
        # Fetch problem test cases
        problem = await db.get(CodingProblem, uuid.UUID(request.problem_id))
        if problem and problem.test_cases:
            test_cases = problem.test_cases

    runner = CodeRunner()
    result = runner.execute(
        language=request.language,
        code=request.code,
        problem_id=request.problem_id,
        test_cases=test_cases
    )
    
    return ExecutionResult(**result)


# ==========================================
# Coding Assistant Endpoints
# ==========================================

class AssistantRequest(BaseModel):
    problem_id: str
    current_code: str

class ChatRequest(AssistantRequest):
    user_message: str
    chat_history: str = ""

@router.post("/assistant/hints")
async def get_coding_hints(
    request: AssistantRequest,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(request.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.generate_coding_hints(
        problem_description=problem.description,
        current_code=request.current_code
    )
    return result

@router.post("/assistant/complexity")
async def analyze_complexity(
    request: AssistantRequest,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(request.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.analyze_code_complexity(
        problem_description=problem.description,
        current_code=request.current_code
    )
    return result

@router.post("/assistant/chat")
async def copilot_chat(
    request: ChatRequest,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(request.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.chat_with_copilot(
        problem_description=problem.description,
        current_code=request.current_code,
        user_message=request.user_message,
        chat_history=request.chat_history
    )
    return {"response": result}
