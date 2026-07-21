import asyncio
import uuid
import logging
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks, Request
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.models.resume import (
    Resume, ResumeAnalysis, ResumeSkill, ResumeExperience, ResumeProject, ResumeEducation,
    ResumeProjectTechnology, ResumeExperienceTechnology, Technology
)
from app.core.storage import StorageService
from app.core.rate_limit import limiter
from app.services.resume_pipeline import process_resume_background
from app.services.ai.gateway import AIGateway
from app.services.ai.prompts.manager import PromptManager
from app.services.ai.schemas import ResumeIntelligenceV2Result

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
async def upload_resume(
    request: Request,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> Any:
    """
    Securely upload a resume. Returns 202 immediately and processes via background task.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX are supported."
        )
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10MB limit."
        )

    file_ext = ALLOWED_MIME_TYPES[file.content_type]
    secure_filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_ext}"
    
    file_path = await StorageService.save_upload_file(file, secure_filename)

    # Delete any existing resumes for this user to enforce 1-resume policy
    stmt = select(Resume).where(Resume.user_id == current_user.id)
    existing_resumes = (await db.execute(stmt)).scalars().all()
    for er in existing_resumes:
        if er.file_url:
            StorageService.delete_file(er.file_url)
        await db.delete(er)
    await db.commit()

    new_resume = Resume(
        user_id=current_user.id,
        title=file.filename or "Untitled Resume",
        file_url=file_path,
        file_type=file_ext,
        is_parsed=False,
        parsing_status="pending",
    )
    
    db.add(new_resume)
    await db.commit()
    await db.refresh(new_resume)
    
    if file_path is None:
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")
        
    # Start background parsing task
    background_tasks.add_task(
        process_resume_background,
        new_resume.id,
        file_path
    )
    
    return {
        "success": True,
        "message": "Resume uploaded successfully. Processing in background.",
        "data": {
            "id": str(new_resume.id),
            "title": new_resume.title,
            "parsing_status": new_resume.parsing_status,
        }
    }

@router.get("")
@router.get("/")
async def list_resumes(
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """List all resumes for the current user."""
    stmt = select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    resumes = (await db.execute(stmt)).scalars().all()
    
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "parsing_status": r.parsing_status,
            "created_at": r.created_at
        } for r in resumes
    ]

@router.get("/{resume_id}/status")
@limiter.limit("30/minute")
async def get_resume_status(
    request: Request,
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    return {
        "id": str(resume.id),
        "status": resume.parsing_status,
        "is_parsed": resume.is_parsed
    }

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    """Delete a resume and its associated file securely."""
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if resume.file_url:
        StorageService.delete_file(resume.file_url)
        
    await db.delete(resume)
    await db.commit()

@router.get("/{resume_id}/download")
@limiter.limit("5/minute")
async def download_resume(
    request: Request,
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    """Download the actual resume file."""
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not resume.file_url:
        raise HTTPException(status_code=404, detail="Resume file not found")
        
    import os
    if not os.path.exists(resume.file_url):
        raise HTTPException(status_code=404, detail="Resume file is missing from storage")
        
    return FileResponse(
        path=resume.file_url,
        filename=resume.title,
        media_type=f"application/{resume.file_type}" if resume.file_type == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@router.get("/{resume_id}")
async def get_resume_overview(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    stmt = select(Resume).options(
        selectinload(Resume.analysis)
    ).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    
    result = await db.execute(stmt)
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    analysis_data = None
    # pyrefly: ignore [redundant-condition]
    if resume.analysis:
        analysis_data = {
            "id": str(resume.analysis.id),
            "overall_score": resume.analysis.overall_score,
            "ats_score": getattr(resume.analysis, "ats_score", None),
            "technical_score": getattr(resume.analysis, "technical_score", None),
            "communication_score": getattr(resume.analysis, "communication_score", None),
            "summary": resume.analysis.summary,
            "strengths": resume.analysis.strengths,
            "weaknesses": resume.analysis.weaknesses,
            "recommendations": resume.analysis.recommendations,
            "career_trajectory": resume.analysis.career_trajectory,
            "skill_gap": getattr(resume.analysis, "skill_gap", []),
            "missing_keywords": getattr(resume.analysis, "missing_keywords", []),
            "learning_roadmap": getattr(resume.analysis, "learning_roadmap", []),
            "interview_readiness": getattr(resume.analysis, "interview_readiness", None),
        }

    return {
        "id": str(resume.id),
        "title": resume.title,
        "status": resume.parsing_status,
        "created_at": resume.created_at,
        "analysis": analysis_data
    }

@router.get("/{resume_id}/analysis")
async def get_resume_analysis(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeAnalysis).where(ResumeAnalysis.resume_id == resume_id)
    analysis = (await db.execute(stmt)).scalar_one_or_none()
    if not analysis:
        return None
        
    return {
        "id": str(analysis.id),
        "overall_score": analysis.overall_score,
        "ats_score": getattr(analysis, "ats_score", None),
        "technical_score": getattr(analysis, "technical_score", None),
        "communication_score": getattr(analysis, "communication_score", None),
        "summary": analysis.summary,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "recommendations": analysis.recommendations,
        "career_trajectory": analysis.career_trajectory,
        "skill_gap": getattr(analysis, "skill_gap", []),
        "missing_keywords": getattr(analysis, "missing_keywords", []),
        "learning_roadmap": getattr(analysis, "learning_roadmap", []),
        "interview_readiness": getattr(analysis, "interview_readiness", None),
    }

@router.get("/{resume_id}/intelligence-v2")
async def get_resume_intelligence_v2(
    request: Request,
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    target_role: str = "Software Engineer",
) -> Any:
    """Get advanced Resume Intelligence V2 analysis."""
    stmt = select(Resume).options(
        selectinload(Resume.analysis),
        selectinload(Resume.skills),
        selectinload(Resume.experiences),
        selectinload(Resume.projects)
    ).where(Resume.id == resume_id)
    resume = (await db.execute(stmt)).scalar_one_or_none()
    
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    analysis = resume.analysis
    if not analysis:
        raise HTTPException(status_code=400, detail="Resume analysis not completed yet")
        
    # Check if V2 fields are already populated
    if getattr(analysis, "company_match_scores", None) and getattr(analysis, "rewrite_suggestions", None):
        return {
            "ats_score": getattr(analysis, "ats_score", None),
            "keyword_analysis": getattr(analysis, "keyword_analysis", []), # Might need this field in model, using existing or mock
            "missing_skills": getattr(analysis, "skill_gap", []),
            "company_match_scores": getattr(analysis, "company_match_scores", []),
            "rewrite_suggestions": getattr(analysis, "rewrite_suggestions", []),
            "project_quality_analysis": getattr(analysis, "project_quality", []),
            "technology_coverage": getattr(analysis, "technology_coverage", {}),
            "industry_recommendations": getattr(analysis, "industry_recommendations", []),
            "career_recommendations": getattr(analysis, "career_recommendations", []),
        }
        
    # Otherwise generate on the fly
    skills_summary = ", ".join([s.name for s in resume.skills])
    exp_summary = "\\n".join([f"{e.role} at {e.company_name}: {(e.description or '')[:100]}..." for e in resume.experiences])
    proj_summary = "\\n".join([f"{p.name}: {(p.description or '')[:100]}..." for p in resume.projects])
    
    prompt = PromptManager.get_prompt(
        category="resume",
        prompt_name="intelligence_v2",
        version="v1",
        resume_content=resume.content[:2000] if resume.content else "No content",
        skills_summary=skills_summary,
        experience_summary=exp_summary,
        projects_summary=proj_summary,
        target_role=target_role
    )
    
    gateway = AIGateway()
    result: ResumeIntelligenceV2Result = await asyncio.to_thread(
        gateway.generate_structured_output,
        prompt,
        ResumeIntelligenceV2Result,
        "You are a Senior Technical Recruiter and Career Coach performing advanced resume intelligence analysis."
    )
    
    # Store the results
    analysis.ats_score = result.ats_score
    # pyrefly: ignore [missing-attribute]
    analysis.company_match_scores = result.company_match_scores
    analysis.rewrite_suggestions = result.rewrite_suggestions
    analysis.project_quality = result.project_quality_analysis
    analysis.technology_coverage = result.technology_coverage
    analysis.industry_recommendations = result.industry_recommendations
    analysis.career_recommendations = result.career_recommendations
    
    await db.commit()
    
    return result.model_dump()
async def get_resume_recommendations(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeAnalysis).where(ResumeAnalysis.resume_id == resume_id)
    analysis = (await db.execute(stmt)).scalar_one_or_none()
    if not analysis:
        return []
    return analysis.recommendations

@router.get("/{resume_id}/skills")
async def get_resume_skills(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeSkill).options(selectinload(ResumeSkill.technology)).where(ResumeSkill.resume_id == resume_id)
    skills = (await db.execute(stmt)).scalars().all()
    
    result = []
    for skill in skills:
        result.append({
            "id": str(skill.id),
            "name": skill.name,
            "proficiency": skill.proficiency,
            "years_experience": skill.years_experience,
            # pyrefly: ignore [redundant-condition]
            "category": skill.technology.category if skill.technology else None
        })
    return result

@router.get("/{resume_id}/experience")
async def get_resume_experience(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeExperience).options(
        selectinload(ResumeExperience.technologies).selectinload(ResumeExperienceTechnology.technology)
    ).where(ResumeExperience.resume_id == resume_id)
    experience = (await db.execute(stmt)).scalars().all()
    
    # Format for frontend
    result = []
    for exp in experience:
        e_dict = {
            "id": exp.id,
            "company_name": exp.company_name,
            "role": exp.role,
            "start_date": exp.start_date,
            "end_date": exp.end_date,
            "description": exp.description,
            "technologies": [t.technology.name for t in exp.technologies] if exp.technologies else []
        }
        result.append(e_dict)
    return result

@router.get("/{resume_id}/projects")
async def get_resume_projects(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeProject).options(
        selectinload(ResumeProject.technologies).selectinload(ResumeProjectTechnology.technology)
    ).where(ResumeProject.resume_id == resume_id)
    projects = (await db.execute(stmt)).scalars().all()
    
    # Format for frontend
    result = []
    for proj in projects:
        p_dict = {
            "id": proj.id,
            "name": proj.name,
            "description": proj.description,
            "url": proj.url,
            "technologies": [t.technology.name for t in proj.technologies] if proj.technologies else []
        }
        result.append(p_dict)
    return result

@router.get("/{resume_id}/education")
async def get_resume_education(
    resume_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    stmt = select(ResumeEducation).where(ResumeEducation.resume_id == resume_id)
    education = (await db.execute(stmt)).scalars().all()
    
    result = []
    for edu in education:
        result.append({
            "id": str(edu.id),
            "institution": edu.institution,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "start_date": edu.start_date,
            "end_date": edu.end_date,
        })
    return result

@router.post("/{resume_id}/reanalyze", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("2/minute")
async def reanalyze_resume(
    request: Request,
    resume_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
) -> Any:
    resume = await db.get(Resume, resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Trigger background task for re-processing
    resume.parsing_status = "processing"
    resume.is_parsed = False
    
    # Ideally, we should delete old analysis data here, or let the pipeline upsert.
    # To keep it simple, we'll delete the old analysis so constraints don't break.
    stmt_del = select(ResumeAnalysis).where(ResumeAnalysis.resume_id == resume.id)
    old_analysis = (await db.execute(stmt_del)).scalar_one_or_none()
    if old_analysis:
        await db.delete(old_analysis)
        
    await db.commit()
    
    file_url = resume.file_url
    if file_url is None:
        raise HTTPException(status_code=400, detail="Resume file not found")
        
    background_tasks.add_task(process_resume_background, resume.id, file_url)
    return {"message": "Reanalysis triggered.", "status": "processing"}
