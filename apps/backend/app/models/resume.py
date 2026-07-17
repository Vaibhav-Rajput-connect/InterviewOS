"""
Resume and Resume Intelligence models.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func, Integer, JSON, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.db.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_parsed: Mapped[bool] = mapped_column(Boolean, default=False)
    parsing_status: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g. 'pending', 'processing', 'completed', 'failed'
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="resumes")
    analysis: Mapped["ResumeAnalysis"] = relationship(back_populates="resume", uselist=False, cascade="all, delete-orphan")
    sections: Mapped[list["ResumeSection"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
    skills: Mapped[list["ResumeSkill"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
    experiences: Mapped[list["ResumeExperience"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
    educations: Mapped[list["ResumeEducation"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
    projects: Mapped[list["ResumeProject"]] = relationship(back_populates="resume", cascade="all, delete-orphan")
    embeddings: Mapped[list["Embedding"]] = relationship(back_populates="resume", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Resume {self.title}>"

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    overall_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ats_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    technical_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    communication_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    career_trajectory: Mapped[str | None] = mapped_column(Text, nullable=True)
    skill_gap: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    missing_keywords: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    learning_roadmap: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    interview_readiness: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Resume Intelligence V2 additions
    company_match_scores: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    rewrite_suggestions: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    project_quality: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    technology_coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    industry_recommendations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    career_recommendations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    resume: Mapped["Resume"] = relationship(back_populates="analysis")

class ResumeSection(Base):
    __tablename__ = "resume_sections"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    section_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'experience', 'education', 'skills', 'summary'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    resume: Mapped["Resume"] = relationship(back_populates="sections")

class ResumeSkill(Base):
    __tablename__ = "resume_skills"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    technology_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("technologies.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    proficiency: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g. 'Beginner', 'Intermediate', 'Expert'
    years_experience: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    resume: Mapped["Resume"] = relationship(back_populates="skills")
    technology: Mapped["Technology"] = relationship(back_populates="resume_skills")

class ResumeExperience(Base):
    __tablename__ = "resume_experiences"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    highlights: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    resume: Mapped["Resume"] = relationship(back_populates="experiences")
    technologies: Mapped[list["ResumeExperienceTechnology"]] = relationship(back_populates="experience", cascade="all, delete-orphan")

class ResumeExperienceTechnology(Base):
    __tablename__ = "resume_experience_technologies"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resume_experiences.id", ondelete="CASCADE"), nullable=False)
    technology_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("technologies.id", ondelete="CASCADE"), nullable=False)
    
    experience: Mapped["ResumeExperience"] = relationship(back_populates="technologies")
    technology: Mapped["Technology"] = relationship(back_populates="experience_links")

class ResumeEducation(Base):
    __tablename__ = "resume_educations"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str] = mapped_column(String(255), nullable=False)
    field_of_study: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    resume: Mapped["Resume"] = relationship(back_populates="educations")

class ResumeProject(Base):
    __tablename__ = "resume_projects"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    
    resume: Mapped["Resume"] = relationship(back_populates="projects")
    technologies: Mapped[list["ResumeProjectTechnology"]] = relationship(back_populates="project", cascade="all, delete-orphan")

class ResumeProjectTechnology(Base):
    __tablename__ = "resume_project_technologies"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resume_projects.id", ondelete="CASCADE"), nullable=False)
    technology_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("technologies.id", ondelete="CASCADE"), nullable=False)
    
    project: Mapped["ResumeProject"] = relationship(back_populates="technologies")
    technology: Mapped["Technology"] = relationship(back_populates="project_links")

class Technology(Base):
    __tablename__ = "technologies"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True) # e.g. 'Language', 'Framework', 'Database'
    
    resume_skills: Mapped[list["ResumeSkill"]] = relationship(back_populates="technology")
    experience_links: Mapped[list["ResumeExperienceTechnology"]] = relationship(back_populates="technology")
    project_links: Mapped[list["ResumeProjectTechnology"]] = relationship(back_populates="technology")

class Embedding(Base):
    __tablename__ = "embeddings"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(768), nullable=False) # Gemini text-embedding-004 is 768 dims by default
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    resume: Mapped["Resume"] = relationship(back_populates="embeddings")
