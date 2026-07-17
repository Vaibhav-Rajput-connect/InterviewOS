"""
Interview Report Generator — generates professional interview reports.
"""

import uuid
import json
import logging
import asyncio
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.interview_engine import InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation
from app.models.full_evaluation import FullEvaluation
from app.models.resume import Resume, ResumeAnalysis
from app.services.ai.gateway import AIGateway
from app.services.ai.schemas import InterviewReportResult
from app.services.ai.prompts.manager import PromptManager

logger = logging.getLogger(__name__)


class ReportGeneratorService:
    """
    Generates comprehensive, professional interview reports.
    Collects session data, evaluations, and resume context to produce
    a structured report suitable for candidates and hiring managers.
    """

    def __init__(self):
        self.ai_gateway = AIGateway()

    async def generate_report(
        self,
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> dict:
        """
        Generate a professional interview report from session data.
        Returns a structured dict stored as JSON.
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
            raise ValueError(f"Interview session {session_id} not found")

        # 2. Load full evaluation if it exists
        eval_stmt = select(FullEvaluation).where(FullEvaluation.session_id == session_id)
        eval_result = await db.execute(eval_stmt)
        full_eval = eval_result.scalars().first()

        # 3. Build data payloads
        session_transcript = self._build_transcript(session)
        evaluation_data = self._build_evaluation_data(session, full_eval)
        resume_context = await self._build_resume_context(db, session.resume_id)

        # 4. Generate report via AI Gateway
        prompt = PromptManager.get_prompt(
            category="evaluation",
            prompt_name="report_generation",
            version="v1",
            evaluation_data=evaluation_data,
            session_transcript=session_transcript,
            resume_context=resume_context,
            target_role=session.target_role or "Software Engineer",
            target_company=session.target_company or "Top Tech Company",
        )

        system_prompt = "You are a Senior Technical Recruiter generating a professional interview report."

        report_result: InterviewReportResult = await asyncio.to_thread(
            self.ai_gateway.generate_structured_output,
            prompt,
            InterviewReportResult,
            system_prompt,
        )

        # 5. Build the full report structure
        report_data = {
            "session_id": str(session_id),
            "candidate_id": str(user_id),
            "target_role": session.target_role,
            "target_company": session.target_company,
            "difficulty": session.difficulty,
            "question_count": len(session.questions),
            "interview_summary": {
                "executive_summary": report_result.executive_summary,
                "communication_analysis": report_result.communication_analysis,
                "resume_match_assessment": report_result.resume_match_assessment,
            },
            "question_history": self._build_qa_history(session),
            "ai_evaluation": {
                "overall_score": full_eval.overall_score if full_eval else None,
                "technical_score": full_eval.technical_score if full_eval else None,
                "coding_score": full_eval.coding_score if full_eval else None,
                "communication_score": full_eval.communication_score if full_eval else None,
                "confidence_score": full_eval.confidence_score if full_eval else None,
                "strengths": full_eval.strengths if full_eval else [],
                "weaknesses": full_eval.weaknesses if full_eval else [],
            },
            "hiring_recommendation": {
                "recommendation": report_result.hiring_recommendation,
                "justification": report_result.hiring_justification,
                "risk_factors": report_result.risk_factors,
            },
            "personalized_learning_plan": report_result.personalized_learning_plan,
            "next_action_items": report_result.next_action_items,
        }

        logger.info(f"Report generated for session {session_id}")
        return report_data

    def _build_transcript(self, session: InterviewSession) -> str:
        """Build formatted transcript."""
        lines = []
        for q in sorted(session.questions, key=lambda x: x.order):
            lines.append(f"Q{q.order} [{q.category}]: {q.content}")
            if q.answer:
                lines.append(f"A{q.order}: {q.answer.content}")
                if q.answer.evaluation:
                    lines.append(f"  [Score: {q.answer.evaluation.overall_score}/100]")
            lines.append("")
        return "\n".join(lines) if lines else "No transcript available."

    def _build_evaluation_data(self, session: InterviewSession, full_eval: Optional[FullEvaluation]) -> str:
        """Build evaluation summary string."""
        parts = []
        if full_eval:
            parts.append(f"Overall Score: {full_eval.overall_score}/100")
            parts.append(f"Technical: {full_eval.technical_score}/100")
            parts.append(f"Coding: {full_eval.coding_score}/100")
            parts.append(f"Communication: {full_eval.communication_score}/100")
            parts.append(f"System Design: {full_eval.system_design_score}/100")
            if full_eval.strengths:
                parts.append(f"Strengths: {json.dumps(full_eval.strengths)}")
            if full_eval.weaknesses:
                parts.append(f"Weaknesses: {json.dumps(full_eval.weaknesses)}")
        elif session.summary:
            s = session.summary
            parts.append(f"Overall Score: {s.overall_score}/100")
            parts.append(f"Technical: {s.technical_score}/100")
            parts.append(f"Communication: {s.communication_score}/100")
        else:
            parts.append("No evaluation data available yet.")
        return "\n".join(parts)

    def _build_qa_history(self, session: InterviewSession) -> list:
        """Build structured Q&A history."""
        history = []
        for q in sorted(session.questions, key=lambda x: x.order):
            entry = {
                "order": q.order,
                "category": q.category,
                "question": q.content,
                "answer": q.answer.content if q.answer else None,
                "score": q.answer.evaluation.overall_score if q.answer and q.answer.evaluation else None,
            }
            history.append(entry)
        return history

    async def _build_resume_context(self, db: AsyncSession, resume_id: Optional[uuid.UUID]) -> str:
        """Build resume context."""
        if not resume_id:
            return "No resume associated with this session."

        stmt = select(Resume).options(selectinload(Resume.analysis)).where(Resume.id == resume_id)
        result = await db.execute(stmt)
        resume = result.scalars().first()

        if not resume:
            return "Resume not found."

        parts = [f"Resume: {resume.title}"]
        if resume.content:
            parts.append(f"Content: {resume.content[:2000]}")
        if resume.analysis:
            parts.append(f"Overall Score: {resume.analysis.overall_score}/100")
            parts.append(f"ATS Score: {resume.analysis.ats_score}/100")
        return "\n".join(parts)
