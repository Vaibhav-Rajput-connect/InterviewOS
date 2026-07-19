from typing import Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
import uuid
import asyncio

from pydantic import BaseModel
from typing import Optional, List, Dict

from app.api import deps
from app.models import User
from app.models.coding import CodingProblem, UserProblemStatus
from app.services.coding.runner import CodeRunner
from starlette.requests import Request
from app.core.rate_limit import limiter

class ExecutionRequest(BaseModel):
    language: str
    code: str
    problem_id: Optional[str] = None
    custom_testcases: Optional[List[Dict]] = None

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
    difficulty: str | None = None,
    topic: str | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
) -> Any:
    """
    Retrieve coding problems with optional filtering and search.
    """
    from sqlalchemy.orm import selectinload
    query = select(CodingProblem).options(
        selectinload(CodingProblem.tags),
        selectinload(CodingProblem.companies)
    )
    
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

    # First, get the total count of filtered problems
    from sqlalchemy import func
    count_query = select(func.count(CodingProblem.id))
    if difficulty:
        count_query = count_query.filter(CodingProblem.difficulty == difficulty)
    if search:
        search_term = f"%{search}%"
        count_query = count_query.filter(
            or_(
                CodingProblem.title.ilike(search_term),
                CodingProblem.description.ilike(search_term)
            )
        )
    total_count = (await db.execute(count_query)).scalar() or 0

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    problems = result.scalars().all()
    
    # Also fetch the user's statuses for these problems
    problem_ids = [p.id for p in problems]
    statuses = {}
    if problem_ids:
        status_query = select(UserProblemStatus).filter(
            UserProblemStatus.user_id == current_user.id,
            UserProblemStatus.problem_id.in_(problem_ids)
        )
        status_result = await db.execute(status_query)
        statuses = {s.problem_id: s for s in status_result.scalars().all()}
    
    response_items = []
    for p in problems:
        status_obj = statuses.get(p.id)
        response_items.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "difficulty": p.difficulty,
            "topics": [t.name for t in p.tags],
            "companies": [c.name for c in p.companies],
            "status": status_obj.status if status_obj else "untouched",
            "bookmarked": status_obj.bookmarked if status_obj else False,
            "acceptance": "50%"
        })
        
    import math
    return {
        "items": response_items,
        "totalCount": total_count,
        "page": (skip // limit) + 1,
        "pageSize": limit,
        "totalPages": math.ceil(total_count / limit) if total_count > 0 else 1
    }


@router.get("/problem/{id}")
async def get_problem(
    id: uuid.UUID,
    db: deps.DbSession,
    current_user: deps.CurrentUser,
) -> Any:
    """
    Get a specific coding problem by ID.
    """
    query = select(CodingProblem).options(
        selectinload(CodingProblem.tags),
        selectinload(CodingProblem.companies)
    ).where(CodingProblem.id == id)
    
    result = await db.execute(query)
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    status_query = select(UserProblemStatus).filter(
        UserProblemStatus.user_id == current_user.id,
        UserProblemStatus.problem_id == problem.id
    )
    result = await db.execute(status_query)
    status_obj = result.scalar_one_or_none()
    
    return {
        "id": problem.id,
        "title": problem.title,
        "slug": problem.slug,
        "difficulty": problem.difficulty,
        "description": problem.description,
        "constraints": problem.constraints,
        "examples": problem.examples,
        "companies": [c.name for c in problem.companies],
        "topics": [t.name for t in problem.tags],
        "boilerplate": problem.boilerplate,
        "status": status_obj.status if status_obj else "untouched",
        "bookmarked": status_obj.bookmarked if status_obj else False,
    }

@router.post("/problem/{id}/bookmark")
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
    
    if status is not None:
        status.bookmarked = not status.bookmarked  # type: ignore
    else:
        status = UserProblemStatus(
            user_id=current_user.id,
            problem_id=problem.id,
            bookmarked=True
        )
        db.add(status)
        
    await db.commit()
    
    return {"bookmarked": status.bookmarked}

@router.post("/run", response_model=ExecutionResult)
@limiter.limit("15/minute")
async def execute_code(
    payload: ExecutionRequest,
    request: Request,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    """
    Execute code in a sandboxed environment.
    """
    test_cases = None
    if payload.custom_testcases:
        test_cases = payload.custom_testcases
    elif payload.problem_id:
        # Fetch problem test cases
        problem = await db.get(CodingProblem, uuid.UUID(payload.problem_id))
        if problem is not None and problem.test_cases is not None:
            test_cases = problem.test_cases  # type: ignore

    runner = CodeRunner()
    result = await asyncio.to_thread(
        runner.execute,
        language=payload.language,
        code=payload.code,
        problem_id=payload.problem_id,
        test_cases=test_cases  # type: ignore
    )
    
    return ExecutionResult(**result)


@router.post("/submit")
@limiter.limit("10/minute")
async def submit_code(
    payload: ExecutionRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    """
    Execute code, run AI evaluation, save submission, and update status.
    """
    if not payload.problem_id:
        raise HTTPException(status_code=400, detail="problem_id is required for submission")

    problem = await db.get(CodingProblem, uuid.UUID(payload.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # 1. Save Pending Submission
    from app.models.coding import CodingSubmission, UserProblemStatus, ExecutionLog, SubmissionResult
    from sqlalchemy import select
    from datetime import datetime, timezone
    
    submission = CodingSubmission(
        user_id=current_user.id,
        problem_id=problem.id,
        code=payload.code,
        language=payload.language,
        status="pending"
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # 2. Run Code Execution
    runner = CodeRunner()
    
    test_cases = payload.custom_testcases if payload.custom_testcases else problem.test_cases

    exec_result = await asyncio.to_thread(
        runner.execute,
        language=payload.language,
        code=payload.code,
        problem_id=payload.problem_id,
        test_cases=test_cases  # type: ignore
    )
    
    # 3. AI Evaluation
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    
    eval_result = None
    try:
        eval_result = await gateway.evaluate_code_submission(
            problem_description=problem.description,  # type: ignore
            current_code=payload.code,
            execution_result=exec_result
        )
    except Exception as e:
        print(f"Error during AI evaluation: {e}")

    # 4. Update Submission and save related logs
    is_success = exec_result.get("exit_code") == 0 and exec_result.get("failed_count", 0) == 0
    submission.status = "success" if is_success else "failed"  # type: ignore
    
    # Save ExecutionLog
    exec_log = ExecutionLog(
        submission_id=submission.id,
        stdout=exec_result.get("stdout"),
        stderr=exec_result.get("stderr"),
        exit_code=exec_result.get("exit_code"),
        time_ms=exec_result.get("time_ms"),
        memory_kb=exec_result.get("memory_kb"),
        pass_count=exec_result.get("passed_count"),
        fail_count=exec_result.get("failed_count"),
        total_cases=exec_result.get("total_cases"),
        status=exec_result.get("status"),
    )
    db.add(exec_log)
    
    # Save SubmissionResult
    eval_dict = {}
    if eval_result:
        eval_dict = eval_result.model_dump()
        sub_res = SubmissionResult(
            submission_id=submission.id,
            correctness_score=eval_dict.get("correctness_score"),
            code_quality_score=eval_dict.get("code_quality_score"),
            time_complexity=eval_dict.get("time_complexity"),
            space_complexity=eval_dict.get("space_complexity"),
            readability_feedback=eval_dict.get("readability_feedback"),
            best_practices_feedback=eval_dict.get("best_practices_feedback"),
            edge_case_feedback=eval_dict.get("edge_case_feedback"),
            optimization_suggestions=eval_dict.get("optimization_suggestions")
        )
        db.add(sub_res)
    
    # 5. Update User Status
    stmt = select(UserProblemStatus).where(
        UserProblemStatus.user_id == current_user.id,
        UserProblemStatus.problem_id == problem.id
    )
    result = await db.execute(stmt)
    user_status = result.scalar_one_or_none()
    
    if not user_status:
        user_status = UserProblemStatus(
            user_id=current_user.id,
            problem_id=problem.id,
            status="solved" if is_success else "attempted",
            last_attempted_at=datetime.now(timezone.utc)
        )
        db.add(user_status)
    else:
        user_status.last_attempted_at = datetime.now(timezone.utc)  # type: ignore
        if is_success and user_status.status != "solved":  # type: ignore
            user_status.status = "solved"  # type: ignore
            user_status.solved_at = datetime.now(timezone.utc)  # type: ignore
            
    await db.commit()
    
    # 6. Ingest into AI Memory
    try:
        from app.services.ai.memory_service import AIMemoryService
        memory_service = AIMemoryService()
        await memory_service.ingest_coding_session(
            db=db,
            user_id=current_user.id,
            problem_title=str(problem.title),  # type: ignore
            is_success=is_success,
            time_complexity=eval_dict.get("time_complexity", "") if eval_dict else "",
            space_complexity=eval_dict.get("space_complexity", "") if eval_dict else ""
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to ingest coding memory: {e}")
    
    return {
        "submission_id": str(submission.id),
        "status": submission.status,
        "execution": exec_result,
        "evaluation": eval_dict
    }


# ==========================================
# Coding Assistant Endpoints
# ==========================================

class AssistantRequest(BaseModel):
    problem_id: str
    current_code: str

class ChatRequest(AssistantRequest):
    user_message: str
    chat_history: str = ""

@router.post("/hint")
@limiter.limit("5/minute")
async def get_coding_hints(
    payload: AssistantRequest,
    request: Request,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(payload.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.generate_coding_hints(
        problem_description=problem.description,  # type: ignore
        current_code=payload.current_code
    )
    
    from app.models.coding import CodingHint
    for hint in result.hints:
        hint_model = CodingHint(
            user_id=current_user.id,
            problem_id=problem.id,
            code_snapshot=payload.current_code,
            hint_text=hint
        )
        db.add(hint_model)
    await db.commit()
    
    return result

@router.post("/review")
@limiter.limit("5/minute")
async def analyze_complexity(
    payload: AssistantRequest,
    request: Request,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(payload.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.analyze_code_complexity(
        problem_description=problem.description,  # type: ignore
        current_code=payload.current_code
    )
    return result

@router.post("/assistant/chat")
@limiter.limit("5/minute")
async def copilot_chat(
    payload: ChatRequest,
    request: Request,
    current_user: deps.CurrentUser,
    db: deps.DbSession,
) -> Any:
    problem = await db.get(CodingProblem, uuid.UUID(payload.problem_id))
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from app.services.ai.gateway import AIGateway
    gateway = AIGateway()
    result = await gateway.chat_with_copilot(
        problem_description=problem.description,  # type: ignore
        current_code=payload.current_code,
        user_message=payload.user_message,
        chat_history=payload.chat_history
    )
    return {"response": result}

@router.get("/submissions")
async def get_submissions(
    db: deps.DbSession,
    current_user: deps.CurrentUser,
    problem_id: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
) -> Any:
    """
    Get a list of submissions for the current user.
    """
    from app.models.coding import CodingSubmission
    from sqlalchemy.orm import selectinload
    from sqlalchemy import desc
    
    query = select(CodingSubmission).filter(CodingSubmission.user_id == current_user.id)
    
    if problem_id:
        query = query.filter(CodingSubmission.problem_id == uuid.UUID(problem_id))
        
    query = query.order_by(desc(CodingSubmission.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "problem_id": s.problem_id,
            "language": s.language,
            "status": s.status,
            "created_at": s.created_at
        }
        for s in submissions
    ]

@router.get("/submission/{id}")
async def get_submission(
    id: uuid.UUID,
    db: deps.DbSession,
    current_user: deps.CurrentUser,
) -> Any:
    """
    Get details of a specific submission.
    """
    from app.models.coding import CodingSubmission
    from sqlalchemy.orm import selectinload
    
    query = select(CodingSubmission).options(
        selectinload(CodingSubmission.execution_log),
        selectinload(CodingSubmission.evaluation_result)
    ).where(CodingSubmission.id == id, CodingSubmission.user_id == current_user.id)
    
    result = await db.execute(query)
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    return {
        "id": submission.id,
        "problem_id": submission.problem_id,
        "code": submission.code,
        "language": submission.language,
        "status": submission.status,
        "created_at": submission.created_at,
        "execution_log": {
            "stdout": submission.execution_log.stdout if submission.execution_log else None,
            "stderr": submission.execution_log.stderr if submission.execution_log else None,
            "exit_code": submission.execution_log.exit_code if submission.execution_log else None,
            "time_ms": submission.execution_log.time_ms if submission.execution_log else None,
            "memory_kb": submission.execution_log.memory_kb if submission.execution_log else None,
            "pass_count": submission.execution_log.pass_count if submission.execution_log else None,
            "fail_count": submission.execution_log.fail_count if submission.execution_log else None,
            "status": submission.execution_log.status if submission.execution_log else None,
        } if submission.execution_log else None,
        "evaluation": {
            "correctness_score": submission.evaluation_result.correctness_score if submission.evaluation_result else None,
            "code_quality_score": submission.evaluation_result.code_quality_score if submission.evaluation_result else None,
            "time_complexity": submission.evaluation_result.time_complexity if submission.evaluation_result else None,
            "space_complexity": submission.evaluation_result.space_complexity if submission.evaluation_result else None,
            "readability_feedback": submission.evaluation_result.readability_feedback if submission.evaluation_result else None,
            "best_practices_feedback": submission.evaluation_result.best_practices_feedback if submission.evaluation_result else None,
            "edge_case_feedback": submission.evaluation_result.edge_case_feedback if submission.evaluation_result else None,
            "optimization_suggestions": submission.evaluation_result.optimization_suggestions if submission.evaluation_result else None,
        } if submission.evaluation_result else None
    }
