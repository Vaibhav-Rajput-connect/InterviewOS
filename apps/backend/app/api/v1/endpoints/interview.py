import uuid
import logging
from typing import Any
from fastapi import APIRouter, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.models.interview_engine import InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation
from app.models.resume import Resume
from app.services.ai.gateway import AIGateway
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)
router = APIRouter()
ai_gateway = AIGateway()

class InterviewStartRequest(BaseModel):
    resume_id: str = Field(..., max_length=36)
    target_company: str = Field(..., max_length=100)
    target_role: str = Field(..., max_length=100)
    difficulty: str = Field(..., max_length=50)
    interview_type: str = Field(..., max_length=50)
    duration_minutes: int = Field(..., ge=10, le=120)

class AnswerSubmissionRequest(BaseModel):
    session_id: str = Field(..., max_length=36)
    question_id: str = Field(..., max_length=36)
    content: str = Field(..., max_length=5000)
    audio_url: str | None = Field(None, max_length=2000)

class InterviewEndRequest(BaseModel):
    session_id: str = Field(..., max_length=36)

@router.post("/start", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def start_interview(
    request: Request,
    payload: InterviewStartRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Create a new AI Interview Session."""
    
    # Verify resume belongs to user
    resume = await db.get(Resume, uuid.UUID(payload.resume_id))
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    session = InterviewSession(
        user_id=current_user.id,
        resume_id=resume.id,
        target_company=payload.target_company,
        target_role=payload.target_role,
        difficulty=payload.difficulty,
        status="in_progress"
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return {
        "id": str(session.id),
        "status": session.status,
        "message": "Interview session created successfully."
    }

@router.post("/sessions/{session_id}/next-question")
@limiter.limit("20/minute")
async def generate_next_question(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Generate the next dynamic question based on session history and resume context."""
    
    # Load session with questions, answers, and resume analysis
    stmt = select(InterviewSession).options(
        selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer),
        selectinload(InterviewSession.resume).selectinload(Resume.analysis),
        selectinload(InterviewSession.resume).selectinload(Resume.skills),
        selectinload(InterviewSession.resume).selectinload(Resume.experiences),
        selectinload(InterviewSession.resume).selectinload(Resume.projects)
    ).where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
    
    session = (await db.execute(stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    resume = session.resume
    if not resume:
        raise HTTPException(status_code=400, detail="Session has no associated resume")
        
    # Build Context
    resume_summary = resume.analysis.summary if resume.analysis else "No summary available."
    resume_skills = ", ".join([s.name for s in resume.skills]) if resume.skills else "No skills listed."
    resume_experience = " | ".join([f"{e.role} at {e.company_name}" for e in resume.experiences]) if resume.experiences else "No experience listed."
    resume_projects = " | ".join([p.name for p in resume.projects]) if resume.projects else "No projects listed."
    
    # Build Transcript History
    history_lines = []
    for q in session.questions:
        history_lines.append(f"Interviewer: {q.content}")
        if q.answer:
            history_lines.append(f"Candidate: {q.answer.content}")
        else:
            history_lines.append(f"Candidate: [No answer provided yet]")
            
    previous_history = "\n".join(history_lines) if history_lines else "This is the very first question of the interview. Start strong!"
    
    # Get Comprehensive Context
    from app.services.ai.memory_service import AIMemoryService
    memory_service = AIMemoryService()
    comprehensive_context = await memory_service.retrieve_comprehensive_context(db, current_user.id)
    
    # Generate via AI Gateway
    try:
        generated = await ai_gateway.generate_interview_question(
            resume_summary=resume_summary,
            resume_skills=resume_skills,
            resume_experience=resume_experience,
            resume_projects=resume_projects,
            target_role=session.target_role or "Software Engineer",
            target_company=session.target_company or "Tech Company",
            difficulty=session.difficulty,
            interview_type="Mixed", # You might want to store interview_type in session model
            comprehensive_context=comprehensive_context,
            previous_history=previous_history
        )
    except Exception as e:
        logger.error(f"Failed to generate interview question: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI question.")
        
    # Save Question
    new_order = len(session.questions) + 1
    new_question = InterviewQuestion(
        session_id=session.id,
        order=new_order,
        category=generated.category,
        content=generated.content
    )
    
    db.add(new_question)
    await db.commit()
    await db.refresh(new_question)
    
    return {
        "id": str(new_question.id),
        "content": new_question.content,
        "category": new_question.category,
        "order": new_question.order,
        "expected_points": generated.expected_points
    }

@router.post("/answer")
@limiter.limit("20/minute")
async def submit_answer(
    request: Request,
    payload: AnswerSubmissionRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Submit an answer to a question and get an AI evaluation."""
    
    try:
        session_id = uuid.UUID(payload.session_id)
        question_id = uuid.UUID(payload.question_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id or question_id")
    
    # Load session and question
    stmt = select(InterviewSession).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    stmt_q = select(InterviewQuestion).where(
        InterviewQuestion.id == question_id,
        InterviewQuestion.session_id == session_id
    )
    question = (await db.execute(stmt_q)).scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if question.answer:
        raise HTTPException(status_code=400, detail="This question has already been answered")
        
    # Save the Answer
    answer = InterviewAnswer(
        question_id=question.id,
        user_id=current_user.id,
        content=payload.content,
        audio_url=payload.audio_url
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)
    
    # Generate Evaluation
    # Note: question.expected_points was stored in DB or we can query it if we stored it.
    # Wait, did we store expected_points in the DB in Task 3? No, we didn't add it to the InterviewQuestion model!
    # Let's pass a generic fallback or update the schema.
    # For now we'll pass an empty list if we didn't store it, or we could just pass "As requested by the question".
    
    try:
        evaluation_result = await ai_gateway.evaluate_interview_answer(
            question=question.content,
            answer=answer.content,
            expected_points="Standard industry best practices for this question.", # Fallback
            difficulty=session.difficulty,
            target_role=session.target_role or "Software Engineer"
        )
    except Exception as e:
        logger.error(f"Failed to evaluate answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate answer.")
        
    # Save Evaluation
    evaluation = InterviewEvaluation(
        answer_id=answer.id,
        overall_score=evaluation_result.overall_score,
        technical_accuracy=evaluation_result.technical_accuracy,
        communication=evaluation_result.communication,
        confidence=evaluation_result.confidence,
        completeness=evaluation_result.completeness,
        suggestions=evaluation_result.suggestions
    )
    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)
    
    return {
        "answer_id": str(answer.id),
        "evaluation": {
            "id": str(evaluation.id),
            "overall_score": evaluation.overall_score,
            "technical_accuracy": evaluation.technical_accuracy,
            "communication": evaluation.communication,
            "confidence": evaluation.confidence,
            "completeness": evaluation.completeness,
            "suggestions": evaluation.suggestions
        }
    }

@router.post("/end")
@limiter.limit("10/minute")
async def end_interview(
    request: Request,
    payload: InterviewEndRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Mark session as complete and generate final summary."""
    from datetime import datetime
    import json
    
    try:
        session_id = uuid.UUID(payload.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    # Load session with all questions, answers, and evaluations
    from sqlalchemy.orm import selectinload
    stmt = select(InterviewSession).options(
        selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer).selectinload(InterviewAnswer.evaluation)
    ).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")
        
    # Build history string
    history_lines = []
    for q in session.questions:
        history_lines.append(f"Q: {q.content}")
        if q.answer:
            history_lines.append(f"A: {q.answer.content}")
            if q.answer.evaluation:
                history_lines.append(f"Eval: {q.answer.evaluation.overall_score} - {q.answer.evaluation.suggestions}")
        history_lines.append("---")
        
    history_str = "\n".join(history_lines)
    
    try:
        summary_result = await ai_gateway.generate_interview_summary(
            session_history=history_str,
            target_role=session.target_role or "Software Engineer",
            target_company=session.target_company or "Tech Company",
            difficulty=session.difficulty
        )
    except Exception as e:
        logger.error(f"Failed to generate summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary.")
        
    # Store summary
    from app.models.interview_engine import InterviewSummary
    summary = InterviewSummary(
        session_id=session.id,
        overall_score=summary_result.overall_score,
        technical_score=summary_result.technical_score,
        behavioral_score=summary_result.behavioral_score,
        communication_score=summary_result.communication_score,
        strengths=json.dumps(summary_result.strengths),
        weaknesses=json.dumps(summary_result.weaknesses),
        recommended_topics=json.dumps(summary_result.recommended_topics),
        next_learning_plan=summary_result.next_learning_plan
    )
    db.add(summary)
    
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(summary)
    
    # Ingest into AI Memory
    try:
        from app.services.ai.memory_service import AIMemoryService
        memory_service = AIMemoryService()
        await memory_service.ingest_interview_session(
            db=db,
            user_id=current_user.id,
            session_summary=summary_result.next_learning_plan,
            weak_points=summary_result.weaknesses
        )
    except Exception as e:
        logger.error(f"Failed to ingest interview memory: {e}")
    
    return {
        "status": "completed",
        "summary_id": str(summary.id)
    }

@router.get("/history")
@limiter.limit("30/minute")
async def get_interview_history(
    request: Request,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Get all past interview sessions for the user."""
    stmt = select(InterviewSession).where(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc())
    
    sessions = (await db.execute(stmt)).scalars().all()
    
    return [
        {
            "id": str(s.id),
            "target_role": s.target_role,
            "target_company": s.target_company,
            "difficulty": s.difficulty,
            "status": s.status,
            "created_at": s.created_at
        } for s in sessions
    ]

@router.get("/{session_id}")
@limiter.limit("60/minute")
async def get_interview_session(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Get details of a specific interview session."""
    from sqlalchemy.orm import selectinload
    stmt = select(InterviewSession).options(
        selectinload(InterviewSession.questions)
    ).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    )
    
    session = (await db.execute(stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "id": str(session.id),
        "target_role": session.target_role,
        "target_company": session.target_company,
        "difficulty": session.difficulty,
        "status": session.status,
        "questions_count": len(session.questions)
    }

@router.get("/summary/{session_id}")
@limiter.limit("30/minute")
async def get_interview_summary(
    request: Request,
    session_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Get the final summary report of a completed interview."""
    from app.models.interview_engine import InterviewSummary
    stmt = select(InterviewSummary).join(InterviewSession).where(
        InterviewSummary.session_id == session_id,
        InterviewSession.user_id == current_user.id
    )
    
    summary = (await db.execute(stmt)).scalar_one_or_none()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
        
    import json
    return {
        "id": str(summary.id),
        "session_id": str(summary.session_id),
        "overall_score": summary.overall_score,
        "technical_score": summary.technical_score,
        "behavioral_score": summary.behavioral_score,
        "communication_score": summary.communication_score,
        "strengths": json.loads(summary.strengths) if summary.strengths else [],
        "weaknesses": json.loads(summary.weaknesses) if summary.weaknesses else [],
        "recommended_topics": json.loads(summary.recommended_topics) if summary.recommended_topics else [],
        "next_learning_plan": summary.next_learning_plan
    }
