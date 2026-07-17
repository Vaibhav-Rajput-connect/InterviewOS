import uuid
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.models.ai_memory import AIMemory
from app.services.ai.memory_service import AIMemoryService
from app.services.ai.gateway import AIGateway
from app.services.ai.prompts.learning_plan import get_learning_plan_prompt
from app.services.ai.prompts.insights import get_insights_prompt

logger = logging.getLogger(__name__)

class InsightsSchema(BaseModel):
    insights: List[str] = Field(description="List of 3-5 highly concise, impactful insights about the user's performance.")

class LearningPlanSchema(BaseModel):
    daily_tasks: List[str] = Field(description="Specific, actionable items to do today.")
    weekly_roadmap: List[str] = Field(description="A focused path for the next 4 weeks.")
    monthly_goals: List[str] = Field(description="High-level objectives to achieve.")
    recommended_problems: List[str] = Field(description="LeetCode-style problem titles or concepts they should practice.")
    recommended_resources: List[str] = Field(description="Books, documentation, or articles to read.")
    difficulty_progression: str = Field(description="How they should scale their difficulty over time.")

class LearningEngineService:
    """
    Service for the Learning Intelligence Engine. Generates dynamic learning plans based on user telemetry.
    """
    
    def __init__(self):
        self.memory_service = AIMemoryService()
        self.ai_gateway = AIGateway()

    async def get_full_user_context(self, db: AsyncSession, user_id: uuid.UUID) -> str:
        """
        Retrieves a comprehensive snapshot of the user's weaknesses and recent history.
        Now uses the enhanced RAG method from AIMemoryService.
        """
        return await self.memory_service.retrieve_comprehensive_context(db, user_id)

    async def generate_learning_plan(self, db: AsyncSession, user_id: uuid.UUID, target_role: str = "Software Engineer", target_company: str = "Top Tech Companies") -> LearningPlanSchema:
        """
        Generates a personalized learning plan and stores it in AIMemory.
        """
        # 1. Retrieve full context
        context = await self.get_full_user_context(db, user_id)
        
        # 2. Get prompt
        prompt = get_learning_plan_prompt(context, target_role, target_company)

        try:
            # 3. Generate structured learning plan
            parsed_data = self.ai_gateway.generate_structured_output(
                prompt="Generate my personalized learning plan based on my telemetry.",
                schema=LearningPlanSchema,
                system_prompt=prompt
            )

            # 4. Store the plan in memory so the Coach can reference it and the Dashboard can display it
            await self.memory_service.add_memory(
                db=db,
                user_id=user_id,
                memory_type="learning_plan",
                content="Generated a new Learning Plan for the user.",
                meta_data=parsed_data.model_dump()
            )

            return parsed_data
            
        except Exception as e:
            logger.error(f"Learning Plan Generation Error: {e}", exc_info=True)
            raise e

    async def generate_insights(self, db: AsyncSession, user_id: uuid.UUID) -> InsightsSchema:
        """
        Generates 3 to 5 punchy insights about the user's performance.
        """
        context = await self.get_full_user_context(db, user_id)
        prompt = get_insights_prompt(context)
        
        try:
            parsed_data = self.ai_gateway.generate_structured_output(
                prompt="Generate insights based on my telemetry.",
                schema=InsightsSchema,
                system_prompt=prompt
            )
            return parsed_data
        except Exception as e:
            logger.error(f"Insights Generation Error: {e}", exc_info=True)
            raise e
