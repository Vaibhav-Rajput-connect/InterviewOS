import uuid
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.models.resume import Embedding
from app.services.embedding import EmbeddingService
from app.services.ai.gateway import AIGateway
from app.services.ai.prompts.coach_chat import get_coach_chat_prompt

logger = logging.getLogger(__name__)

class CoachResponse(BaseModel):
    message: str = Field(description="The response from the AI coach to the user.")

class AICoachService:
    """
    Service for the AI Coach, utilizing pgvector for Retrieval-Augmented Generation (RAG)
    and the AIGateway for intelligent, personalized coaching.
    """
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.ai_gateway = AIGateway()

    async def get_relevant_resume_context(self, db: AsyncSession, resume_id: str, query_text: str, limit: int = 3) -> str:
        """
        Uses pgvector to find the most relevant chunks of a user's resume for a given query.
        """
        query_embedding = self.embedding_service.generate_embedding(query_text)
        
        stmt = (
            select(Embedding)
            .where(Embedding.resume_id == uuid.UUID(resume_id))
            .order_by(Embedding.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        embeddings = result.scalars().all()
        
        if not embeddings:
            return "No specific resume context found."
            
        context_chunks = [f"- {e.chunk_text}" for e in embeddings]
        return "\n".join(context_chunks)

    async def generate_coach_response(self, db: AsyncSession, resume_id: str, user_message: str) -> CoachResponse:
        """
        Generates a personalized coaching response using AIGateway and RAG context.
        """
        context = await self.get_relevant_resume_context(db, resume_id, user_message)
        system_prompt = get_coach_chat_prompt(context)

        try:
            parsed_data = self.ai_gateway.generate_structured_output(
                prompt=user_message,
                schema=CoachResponse,
                system_prompt=system_prompt
            )
            return parsed_data
            
        except Exception as e:
            logger.error(f"AI Coach Generation Error: {e}", exc_info=True)
            raise e
