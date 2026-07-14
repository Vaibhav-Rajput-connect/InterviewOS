from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import Any

from app.api.deps import CurrentUser, DbSession
from app.core.rate_limit import limiter
from app.services.ai_coach import AICoachService
from app.models.resume import Resume

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., max_length=2000)

class FeedbackRequest(BaseModel):
    message: str = Field(..., max_length=2000)

class ChatResponse(BaseModel):
    success: bool
    response: str

def get_coach_service() -> AICoachService:
    return AICoachService()

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("15/minute")
async def chat_with_coach(
    request: Request,
    payload: ChatRequest,
    db: DbSession,
    current_user: CurrentUser,
    coach_service: AICoachService = Depends(get_coach_service),
) -> Any:
    """
    Chat with the AI Coach. It uses the unified AIMemory system for highly personalized context.
    """
    try:
        coach_response = await coach_service.generate_coach_response(
            db=db,
            user_id=current_user.id,
            user_message=payload.message
        )
        
        return ChatResponse(
            success=True,
            response=coach_response.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate coach response: {str(e)}"
        )

@router.get("/history")
@limiter.limit("15/minute")
async def get_chat_history(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve the user's conversational memory history to populate the UI.
    """
    from sqlalchemy import select
    from app.models.ai_memory import AIMemory
    
    stmt = select(AIMemory).where(
        AIMemory.user_id == current_user.id,
        AIMemory.memory_type == "conversation"
    ).order_by(AIMemory.created_at.asc()).limit(50)
    
    result = await db.execute(stmt)
    memories = result.scalars().all()
    
    messages = []
    for mem in memories:
        if mem.content.startswith("User asked AI Coach: "):
            messages.append({"role": "user", "content": mem.content.replace("User asked AI Coach: ", "", 1)})
        elif mem.content.startswith("AI Coach replied: "):
            messages.append({"role": "coach", "content": mem.content.replace("AI Coach replied: ", "", 1)})
            
    return {"messages": messages}

@router.get("/progress")
@limiter.limit("15/minute")
async def get_learning_progress(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Get aggregated learning progress from AIMemory.
    """
    from sqlalchemy import select
    from app.models.ai_memory import AIMemory
    
    stmt = select(AIMemory).where(
        AIMemory.user_id == current_user.id,
        AIMemory.memory_type.in_(["goal", "coding", "interview"])
    ).order_by(AIMemory.created_at.desc()).limit(20)
    
    result = await db.execute(stmt)
    memories = result.scalars().all()
    
    progress = []
    for mem in memories:
        progress.append({
            "type": mem.memory_type,
            "content": mem.content,
            "created_at": mem.created_at
        })
        
    return {"progress": progress}

@router.get("/topics")
@limiter.limit("15/minute")
async def get_weak_topics(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Get weak and strong topics from AIMemory.
    """
    from sqlalchemy import select
    from app.models.ai_memory import AIMemory
    
    stmt = select(AIMemory).where(
        AIMemory.user_id == current_user.id,
        AIMemory.memory_type == "weak_topic"
    ).order_by(AIMemory.created_at.desc()).limit(10)
    
    result = await db.execute(stmt)
    memories = result.scalars().all()
    
    topics = []
    for mem in memories:
        topics.append({
            "content": mem.content,
            "created_at": mem.created_at
        })
        
    return {"weak_topics": topics}

@router.get("/learning-plan")
@limiter.limit("15/minute")
async def get_learning_plan(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Get the most recent learning plan from AIMemory.
    """
    from sqlalchemy import select
    from app.models.ai_memory import AIMemory
    
    stmt = select(AIMemory).where(
        AIMemory.user_id == current_user.id,
        AIMemory.memory_type == "learning_plan"
    ).order_by(AIMemory.created_at.desc()).limit(1)
    
    result = await db.execute(stmt)
    memory = result.scalar_one_or_none()
    
    if not memory or not memory.meta_data:
        return {"plan": None}
        
    return {"plan": memory.meta_data}

@router.post("/learning-plan/generate")
@limiter.limit("5/minute")
async def generate_learning_plan(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Generate a new learning plan based on telemetry.
    """
    from app.services.ai.learning_engine import LearningEngineService
    from app.models.profile import Profile
    from sqlalchemy import select
    
    # Try to get target role/company from profile
    stmt = select(Profile).where(Profile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    target_role = profile.target_role if profile and profile.target_role else "Software Engineer"
    target_company = profile.target_companies[0] if profile and profile.target_companies else "Top Tech Companies"
    
    engine = LearningEngineService()
    try:
        plan = await engine.generate_learning_plan(db, current_user.id, target_role, target_company)
        return {"success": True, "plan": plan.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning plan: {str(e)}"
        )

@router.post("/feedback")
@limiter.limit("15/minute")
async def submit_feedback(
    request: Request,
    payload: FeedbackRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Submit feedback about the AI coach.
    """
    from app.services.ai.memory_service import AIMemoryService
    memory_service = AIMemoryService()
    
    await memory_service.add_memory(
        db=db,
        user_id=current_user.id,
        memory_type="feedback",
        content=payload.message
    )
    
    return {"success": True}

@router.get("/insights")
from app.core.cache import async_ttl_cache
@limiter.limit("15/minute")
@async_ttl_cache(ttl=300)
async def get_insights(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """
    Generate and retrieve personalized AI insights based on user telemetry.
    """
    from app.services.ai.learning_engine import LearningEngineService
    engine = LearningEngineService()
    try:
        insights_data = await engine.generate_insights(db, current_user.id)
        return {"insights": insights_data.insights}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )
