from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Any

from app.api.deps import CurrentUser, DbSession
from app.services.ai_coach import AICoachService
from app.models.resume import Resume

router = APIRouter()

class ChatRequest(BaseModel):
    resume_id: str
    message: str

class ChatResponse(BaseModel):
    success: bool
    response: str

def get_coach_service() -> AICoachService:
    return AICoachService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(
    request: ChatRequest,
    db: DbSession,
    current_user: CurrentUser,
    coach_service: AICoachService = Depends(get_coach_service),
) -> Any:
    """
    Chat with the AI Coach. It uses the user's resume embeddings for personalized context.
    """
    # 1. Verify the resume exists and belongs to the user
    resume = await db.get(Resume, request.resume_id)
    if not resume or str(resume.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )
        
    if not resume.is_parsed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume is not fully parsed yet. Please wait."
        )

    # 2. Generate response using RAG
    try:
        coach_response = await coach_service.generate_coach_response(
            db=db,
            resume_id=request.resume_id,
            user_message=request.message
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
