import os
import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.resume import (
    Resume, ResumeAnalysis, ResumeSkill, ResumeExperience, 
    ResumeProject, ResumeEducation, Embedding, Technology
)
from app.services.resume_parser import ResumeParser
from app.services.ai.gateway import AIGateway
from app.services.ai.schemas import ExtractedResumeMetadata, DeepResumeAnalysis
from app.services.ai.prompts.manager import PromptManager
from app.services.embedding import EmbeddingService
from app.db.engine import async_session_factory
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)

async def process_resume_background(resume_id: uuid.UUID, file_path: str):
    """
    Background worker that extracts data from the resume, parses it via AI,
    maps technologies, generates embeddings, and saves everything to the database.
    """
    logger.info(f"Starting background processing for resume: {resume_id}")
    
    # We create a new DB session for the background task
    async with async_session_factory() as db:
        try:
            # 1. Fetch Resume
            resume = await db.get(Resume, resume_id)
            if not resume:
                logger.error(f"Resume {resume_id} not found.")
                return

            resume.parsing_status = "processing"
            await db.commit()

            # 2. Extract Raw Text
            logger.info("Extracting raw text via ResumeParser")
            raw_text = await run_in_threadpool(ResumeParser.extract_text, file_path)
            resume.content = raw_text

            ai_gateway = AIGateway()
            embedding_service = EmbeddingService()

            # 3. First AI Pass: Extract Metadata
            logger.info("Running AI extraction pass (Metadata)")
            extraction_prompt = PromptManager.get_prompt("resume", "extraction", raw_text=raw_text)
            metadata = await run_in_threadpool(
                ai_gateway.generate_structured_output,
                extraction_prompt,
                ExtractedResumeMetadata
            )
            
            # 4. Second AI Pass: Deep Analysis
            logger.info("Running AI analysis pass (Deep Analysis)")
            analysis_prompt = PromptManager.get_prompt("resume", "analysis", raw_text=raw_text)
            deep_analysis = await run_in_threadpool(
                ai_gateway.generate_structured_output,
                analysis_prompt,
                DeepResumeAnalysis
            )

            # 5. Populate Database
            logger.info("Populating Database with Extracted Data")
            
            analysis = ResumeAnalysis(
                resume_id=resume.id,
                overall_score=deep_analysis.overall_score,
                ats_score=deep_analysis.ats_score,
                technical_score=deep_analysis.technical_score,
                communication_score=deep_analysis.communication_score,
                summary=metadata.summary,
                strengths=deep_analysis.strengths,
                weaknesses=deep_analysis.weaknesses,
                recommendations=deep_analysis.recommendations,
                career_trajectory=deep_analysis.career_trajectory,
                skill_gap=deep_analysis.skill_gap,
                missing_keywords=deep_analysis.missing_keywords,
                learning_roadmap=deep_analysis.learning_roadmap,
                interview_readiness=deep_analysis.interview_readiness,
            )
            db.add(analysis)

            texts_to_embed = []
            
            # 1. Gather all unique technology names
            tech_names = set()
            for skill in metadata.skills:
                tech_names.add(skill.name.lower().strip())
            for exp in metadata.experience:
                for t in exp.technologies:
                    tech_names.add(t.lower().strip())
            for proj in metadata.projects:
                for t in proj.technologies:
                    tech_names.add(t.lower().strip())
                    
            # 2. Fetch/Insert Technologies
            logger.info(f"Mapping {len(tech_names)} technologies")
            tech_map = {}
            if tech_names:
                stmt = select(Technology).where(Technology.name.in_(tech_names))
                existing_techs = (await db.execute(stmt)).scalars().all()
                for tech in existing_techs:
                    tech_map[tech.name.lower()] = tech.id
                
                missing_tech_names = tech_names - set(tech_map.keys())
                for missing in missing_tech_names:
                    new_tech = Technology(name=missing)
                    db.add(new_tech)
                await db.flush() # flush to get IDs for the missing ones
                
                # Refetch to update map (safest way to get the UUIDs)
                stmt = select(Technology).where(Technology.name.in_(tech_names))
                all_techs = (await db.execute(stmt)).scalars().all()
                for tech in all_techs:
                    tech_map[tech.name.lower()] = tech.id

            # 3. Add Skills
            for skill in metadata.skills:
                t_id = tech_map.get(skill.name.lower().strip())
                db_skill = ResumeSkill(
                    resume_id=resume.id,
                    technology_id=t_id,
                    name=skill.name,
                    years_experience=skill.years_experience,
                    proficiency=skill.category
                )
                db.add(db_skill)
                texts_to_embed.append(f"Skill: {skill.name} ({skill.category})")
                
            # 4. Add Experiences
            from app.models.resume import ResumeExperienceTechnology, ResumeProjectTechnology
            for exp in metadata.experience:
                db_exp = ResumeExperience(
                    resume_id=resume.id,
                    company_name=exp.company,
                    role=exp.title,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    description=exp.description
                )
                db.add(db_exp)
                await db.flush()
                for t in exp.technologies:
                    t_id = tech_map.get(t.lower().strip())
                    if t_id:
                        db.add(ResumeExperienceTechnology(experience_id=db_exp.id, technology_id=t_id))
                texts_to_embed.append(f"Experience: {exp.title} at {exp.company}. {exp.description}")
                
            # 5. Add Projects
            for proj in metadata.projects:
                db_proj = ResumeProject(
                    resume_id=resume.id,
                    name=proj.name,
                    description=proj.description,
                    url=proj.url
                )
                db.add(db_proj)
                await db.flush()
                for t in proj.technologies:
                    t_id = tech_map.get(t.lower().strip())
                    if t_id:
                        db.add(ResumeProjectTechnology(project_id=db_proj.id, technology_id=t_id))
                texts_to_embed.append(f"Project: {proj.name}. {proj.description}")
                
            # 6. Add Education
            for edu in metadata.education:
                db_edu = ResumeEducation(
                    resume_id=resume.id,
                    institution=edu.institution,
                    degree=edu.degree,
                    start_date=edu.start_date,
                    end_date=edu.end_date
                )
                db.add(db_edu)

            # 7. Generate Embeddings
            logger.info("Generating embeddings")
            if texts_to_embed:
                vectors = await run_in_threadpool(
                    embedding_service.generate_embeddings_batch, 
                    texts_to_embed
                )
                for idx, (text, vector) in enumerate(zip(texts_to_embed, vectors)):
                    db_embed = Embedding(
                        resume_id=resume.id,
                        chunk_text=text,
                        chunk_index=idx,
                        embedding=vector
                    )
                    db.add(db_embed)

            # Mark as completed
            resume.is_parsed = True
            resume.parsing_status = "completed"
            
            await db.commit()
            logger.info(f"Successfully processed resume: {resume_id}")

        except Exception as e:
            logger.error(f"Failed to process resume {resume_id}: {str(e)}", exc_info=True)
            # Update status to failed
            try:
                resume = await db.get(Resume, resume_id)
                if resume:
                    resume.parsing_status = "failed"
                    await db.commit()
            except Exception as inner_e:
                logger.error(f"Failed to update resume status to failed: {str(inner_e)}", exc_info=True)
        finally:
            # Automated Resume Cleanup: delete physical file after processing
            try:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Deleted physical file: {file_path}")
            except Exception as cleanup_e:
                logger.error(f"Failed to delete physical file {file_path}: {str(cleanup_e)}", exc_info=True)
