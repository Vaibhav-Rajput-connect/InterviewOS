from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import uuid
from sqlalchemy.future import select

from app.api import deps
from app.models.coding import CodingProblem, ProblemTag, ProblemCompany
from app.models import User

router = APIRouter()

class CodingProblemCreate(BaseModel):
    title: str
    slug: str
    difficulty: str
    description: str
    constraints: Optional[List[str]] = None
    examples: Optional[List[Dict]] = None
    test_cases: Optional[List[Dict]] = None
    boilerplate: Optional[Dict[str, str]] = None
    tags: Optional[List[str]] = None
    companies: Optional[List[str]] = None

def verify_admin(current_user: deps.CurrentUser):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.post("/problems", status_code=201)
async def create_problem(
    *,
    db: deps.DbSession,
    problem_in: CodingProblemCreate,
    current_user: User = Depends(verify_admin)
) -> Any:
    """
    Create a new coding problem.
    """
    # Check if slug exists
    query = select(CodingProblem).where(CodingProblem.slug == problem_in.slug)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A problem with this slug already exists."
        )

    problem = CodingProblem(
        title=problem_in.title,
        slug=problem_in.slug,
        difficulty=problem_in.difficulty,
        description=problem_in.description,
        constraints=problem_in.constraints,
        examples=problem_in.examples,
        test_cases=problem_in.test_cases,
        boilerplate=problem_in.boilerplate,
    )
    db.add(problem)
    await db.flush()  # to get problem.id

    if problem_in.tags:
        tags = [ProblemTag(problem_id=problem.id, name=t) for t in problem_in.tags]
        db.add_all(tags)
    
    if problem_in.companies:
        companies = [ProblemCompany(problem_id=problem.id, name=c) for c in problem_in.companies]
        db.add_all(companies)

    await db.commit()
    await db.refresh(problem)
    return {"id": problem.id, "slug": problem.slug}

@router.put("/problem/{id}")
async def update_problem(
    *,
    db: deps.DbSession,
    id: uuid.UUID,
    problem_in: CodingProblemCreate,
    current_user: User = Depends(verify_admin)
) -> Any:
    """
    Update a coding problem.
    """
    problem = await db.get(CodingProblem, id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # pyrefly: ignore [bad-assignment]
    problem.title = problem_in.title
    # pyrefly: ignore [bad-assignment]
    problem.slug = problem_in.slug
    # pyrefly: ignore [bad-assignment]
    problem.difficulty = problem_in.difficulty
    # pyrefly: ignore [bad-assignment]
    problem.description = problem_in.description
    # pyrefly: ignore [bad-assignment]
    problem.constraints = problem_in.constraints
    # pyrefly: ignore [bad-assignment]
    problem.examples = problem_in.examples
    # pyrefly: ignore [bad-assignment]
    problem.test_cases = problem_in.test_cases
    # pyrefly: ignore [bad-assignment]
    problem.boilerplate = problem_in.boilerplate

    # Re-create tags and companies
    from sqlalchemy import delete
    await db.execute(delete(ProblemTag).where(ProblemTag.problem_id == problem.id))
    await db.execute(delete(ProblemCompany).where(ProblemCompany.problem_id == problem.id))

    if problem_in.tags:
        tags = [ProblemTag(problem_id=problem.id, name=t) for t in problem_in.tags]
        db.add_all(tags)
    
    if problem_in.companies:
        companies = [ProblemCompany(problem_id=problem.id, name=c) for c in problem_in.companies]
        db.add_all(companies)

    await db.commit()
    return {"id": problem.id, "slug": problem.slug}

@router.delete("/problem/{id}")
async def delete_problem(
    *,
    db: deps.DbSession,
    id: uuid.UUID,
    current_user: User = Depends(verify_admin)
) -> Any:
    """
    Delete a coding problem.
    """
    problem = await db.get(CodingProblem, id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    await db.delete(problem)
    await db.commit()
    return {"success": True}
