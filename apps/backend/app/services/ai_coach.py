import uuid
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.services.ai.memory_service import AIMemoryService
from app.services.ai.gateway import AIGateway
from app.services.ai.prompts.coach_chat import get_coach_chat_prompt

logger = logging.getLogger(__name__)

class CoachResponse(BaseModel):
    message: str = Field(description="The response from the AI coach to the user.")

class AICoachService:
    """
    Service for the AI Coach, utilizing pgvector for Retrieval-Augmented Generation (RAG)
    via the AIMemory system and the AIGateway for intelligent, personalized coaching.
    """
    
    def __init__(self):
        self.memory_service = AIMemoryService()
        self.ai_gateway = AIGateway()

    async def get_relevant_user_context(self, db: AsyncSession, user_id: uuid.UUID, query_text: str, limit: int = 5) -> str:
        """
        Uses pgvector to find the most relevant memory chunks of a user for a given query.
        """
        return await self.memory_service.retrieve_relevant_context(
            db=db, 
            user_id=user_id, 
            query_text=query_text, 
            limit=limit
        )

    async def generate_coach_response(self, db: AsyncSession, user_id: uuid.UUID, user_message: str) -> CoachResponse:
        """
        Generates a personalized coaching response using AIGateway and RAG context.
        """
        # 1. Store the user's incoming message as memory (conversation)
        await self.memory_service.add_memory(
            db=db,
            user_id=user_id,
            memory_type="conversation",
            content=f"User asked AI Coach: {user_message}"
        )

        # 2. Retrieve relevant context
        context = await self.get_relevant_user_context(db, user_id, user_message)
        system_prompt = get_coach_chat_prompt(context)

        try:
            # 3. Generate response
            parsed_data = self.ai_gateway.generate_structured_output(
                prompt=user_message,
                schema=CoachResponse,
                system_prompt=system_prompt
            )

            # 4. Store AI response as memory
            await self.memory_service.add_memory(
                db=db,
                user_id=user_id,
                memory_type="conversation",
                content=f"AI Coach replied: {parsed_data.message}"
            )

            return parsed_data
            
        except Exception as e:
            logger.error(f"AI Coach Generation Error: {e}", exc_info=True)
            raise e
