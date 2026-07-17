"""
AI Evaluation Engine — comprehensive interview evaluation service.
"""

import uuid
import json
import logging
import asyncio
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.interview_engine import InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation, InterviewSummary
from app.models.full_evaluation import FullEvaluation
from app.models.resume import Resume, ResumeAnalysis
from app.services.ai.gateway import AIGateway
from app.services.ai.schemas import FullEvaluationResult
from app.services.ai.prompts.manager import PromptManager
from app.services.ai.memory_service import AIMemoryService

logger = logging.getLogger(__name__)


class EvaluationEngineService:
    """
    Orchestrates comprehensive interview evaluations.
    Aggregates per-answer scores, generates multi-dimension evaluations,
    and stores results in the FullEvaluation model.
    """

    def __init__(self):
        self.ai_gateway = AIGateway()
        self.memory_service = AIMemoryService()

    async def generate_full_evaluation(
        self,
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> FullEvaluation:
        """
        Generate a comprehensive evaluation for a completed interview session.
        """
        # 1. Load session with all relationships
        stmt = (
            select(InterviewSession)
            .options(
                selectinload(InterviewSession.questions)
                .selectinload(InterviewQuestion.answer)
                .selectinload(InterviewAnswer.evaluation),
                selectinload(InterviewSession.resume),
                selectinload(InterviewSession.summary),
            )
            .where(InterviewSession.id == session_id)
            .where(InterviewSession.user_id == user_id)
        )
        result = await db.execute(stmt)
        session = result.scalars().first()

        if not session:
            raise ValueError(f"Interview session {session_id} not found for user {user_id}")

        # 2. Build session transcript
        session_transcript = self._build_transcript(session)

        # 3. Build resume context
        resume_context = await self._build_resume_context(db, session.resume_id)

        # 4. Retrieve coding context from AI memory
        coding_context = await self.memory_service.retrieve_relevant_context(
            db, user_id, "coding performance", limit=5,
            memory_types=["coding"]
        )

        # 5. Generate evaluation via AI Gateway
        prompt = PromptManager.get_prompt(
            category="evaluation",
            prompt_name="full_evaluation",
            version="v1",
            target_role=session.target_role or "Software Engineer",
            target_company=session.target_company or "Top Tech Company",
            difficulty=session.difficulty or "medium",
            session_transcript=session_transcript,
            resume_context=resume_context,
            coding_context=coding_context,
        )

        system_prompt = "You are a Principal Technical Interviewer generating a comprehensive evaluation."

        evaluation_result: FullEvaluationResult = await asyncio.to_thread(
            self.ai_gateway.generate_structured_output,
            prompt,
            FullEvaluationResult,
            system_prompt,
        )

        # 6. Persist to database
        full_eval = FullEvaluation(
            session_id=session_id,
            user_id=user_id,
            overall_score=evaluation_result.overall_score,
            technical_score=evaluation_result.technical_score,
            coding_score=evaluation_result.coding_score,
            communication_score=evaluation_result.communication_score,
            confidence_score=evaluation_result.confidence_score,
            problem_solving_score=evaluation_result.problem_solving_score,
            system_design_score=evaluation_result.system_design_score,
            behavioral_score=evaluation_result.behavioral_score,
            detailed_feedback=evaluation_result.detailed_feedback,
            strengths=evaluation_result.strengths,
            weaknesses=evaluation_result.weaknesses,
            improvement_suggestions=evaluation_result.improvement_suggestions,
            learning_recommendations=evaluation_result.learning_recommendations,
        )

        db.add(full_eval)
        await db.commit()
        await db.refresh(full_eval)

        # 7. Ingest into AI Memory for future context
        await self.memory_service.add_memory(
            db=db,
            user_id=user_id,
            memory_type="evaluation",
            content=f"Interview evaluation completed. Overall: {evaluation_result.overall_score}/100. "
                    f"Technical: {evaluation_result.technical_score}, Communication: {evaluation_result.communication_score}. "
                    f"Key weakness areas: {', '.join(evaluation_result.weaknesses[:3])}.",
        )

        logger.info(f"Full evaluation generated for session {session_id}: {evaluation_result.overall_score}/100")
        return full_eval

    async def get_evaluation(
        self,
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[FullEvaluation]:
        """Retrieve an existing evaluation for a session."""
        stmt = (
            select(FullEvaluation)
            .where(FullEvaluation.session_id == session_id)
            .where(FullEvaluation.user_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    def _build_transcript(self, session: InterviewSession) -> str:
        """Build a formatted transcript from session Q&A pairs."""
        lines = []
        for q in sorted(session.questions, key=lambda x: x.order):
            lines.append(f"Q{q.order} [{q.category}]: {q.content}")
            if q.answer:
                lines.append(f"A{q.order}: {q.answer.content}")
                if q.answer.evaluation:
                    e = q.answer.evaluation
                    lines.append(
                        f"  [Score: {e.overall_score}/100 | Technical: {e.technical_accuracy} | "
                        f"Communication: {e.communication} | Confidence: {e.confidence}]"
                    )
            lines.append("")
        return "\n".join(lines) if lines else "No Q&A transcript available."

    async def _build_resume_context(self, db: AsyncSession, resume_id: Optional[uuid.UUID]) -> str:
        """Build resume context string from stored resume data."""
        if not resume_id:
            return "No resume provided for this session."

        stmt = (
            select(Resume)
            .options(selectinload(Resume.analysis))
            .where(Resume.id == resume_id)
        )
        result = await db.execute(stmt)
        resume = result.scalars().first()

        if not resume:
            return "Resume not found."

        parts = [f"Resume: {resume.title}"]
        if resume.content:
            # Truncate to avoid token limits
            parts.append(f"Content: {resume.content[:2000]}")
        if resume.analysis:
            a = resume.analysis
            parts.append(f"Overall Score: {a.overall_score}/100")
            parts.append(f"ATS Score: {a.ats_score}/100")
            if a.strengths:
                parts.append(f"Strengths: {', '.join(a.strengths[:5])}")

        return "\n".join(parts)
