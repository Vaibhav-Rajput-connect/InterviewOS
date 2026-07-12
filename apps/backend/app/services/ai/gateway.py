import os
import logging
from typing import Type, TypeVar
from pydantic import BaseModel
import asyncio
from app.services.ai.schemas import GeneratedQuestion, AnswerEvaluationResult
from app.services.ai.prompts.manager import PromptManager

from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.services.ai.providers.base import BaseAIProvider
from app.services.ai.providers.factory import ProviderFactory

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class AIGateway:
    """
    Centralized Gateway for AI services.
    Uses the Provider Strategy Pattern to abstract the underlying AI model.
    """
    
    def __init__(self):
        self.provider: BaseAIProvider = ProviderFactory.get_provider()
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def generate_structured_output(self, prompt: str, schema: Type[T], system_prompt: str | None = None) -> T:
        return self.provider.generate_structured_output(prompt, schema, system_prompt)
        
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        return self.provider.generate_text(prompt, system_prompt)

    async def generate_interview_question(
        self, 
        resume_summary: str,
        resume_skills: str,
        resume_experience: str,
        resume_projects: str,
        target_role: str,
        target_company: str,
        difficulty: str,
        interview_type: str,
        previous_history: str
    ) -> GeneratedQuestion:
        """
        Formats the dynamic interview question prompt and generates the next question.
        Runs the synchronous AI provider call in a background thread.
        """
        prompt = PromptManager.get_prompt(
            category="interview",
            prompt_name="question_generation",
            version="v1",
            resume_summary=resume_summary,
            resume_skills=resume_skills,
            resume_experience=resume_experience,
            resume_projects=resume_projects,
            target_role=target_role,
            target_company=target_company,
            difficulty=difficulty,
            interview_type=interview_type,
            previous_history=previous_history
        )
        
        system_prompt = "You are an expert technical interviewer simulating a real interview."
        
        # Run synchronous generate_structured_output in a thread pool to prevent event loop blocking
        return await asyncio.to_thread(
            self.generate_structured_output,
            prompt,
            GeneratedQuestion,
            system_prompt
        )

    async def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        expected_points: str,
        difficulty: str,
        target_role: str
    ) -> AnswerEvaluationResult:
        """
        Grades the candidate's answer against the expected points.
        """
        prompt = PromptManager.get_prompt(
            category="interview",
            prompt_name="answer_evaluation",
            version="v1",
            question=question,
            answer=answer,
            expected_points=expected_points,
            difficulty=difficulty,
            target_role=target_role
        )
        
        system_prompt = "You are an expert technical interviewer evaluating a candidate's answer."
        
        return await asyncio.to_thread(
            self.generate_structured_output,
            prompt,
            AnswerEvaluationResult,
            system_prompt
        )

    async def generate_interview_summary(
        self,
        session_history: str,
        target_role: str,
        target_company: str,
        difficulty: str
    ) -> SessionSummaryResult:
        """
        Generate the final post-interview summary and report.
        """
        prompt = PromptManager.get_prompt(
            category="interview",
            prompt_name="session_summary",
            version="v1",
            session_history=session_history,
            target_role=target_role,
            target_company=target_company,
            difficulty=difficulty
        )
        
        system_prompt = "You are an expert technical interviewer generating a performance report."
        
        return await asyncio.to_thread(
            self.generate_structured_output,
            prompt,
            SessionSummaryResult,
            system_prompt
        )
