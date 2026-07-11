from pydantic import BaseModel, Field
from typing import List, Optional

class ExtractedSkill(BaseModel):
    name: str = Field(description="The name of the skill (e.g., Python, React, Project Management).")
    category: str = Field(description="Category of the skill (e.g., Programming Languages, Frameworks, Soft Skills).")
    years_experience: Optional[float] = Field(None, description="Estimated years of experience if mentioned, otherwise null.")

class ExtractedExperience(BaseModel):
    title: str = Field(description="Job title or role.")
    company: str = Field(description="Name of the company or organization.")
    start_date: Optional[str] = Field(None, description="Start date (e.g., Jan 2020).")
    end_date: Optional[str] = Field(None, description="End date (e.g., Present or Dec 2022).")
    description: str = Field(description="Detailed description of responsibilities and achievements.")
    technologies: List[str] = Field(default_factory=list, description="Technologies used in this role.")

class ExtractedProject(BaseModel):
    name: str = Field(description="Name of the project.")
    description: str = Field(description="Detailed description of the project.")
    technologies: List[str] = Field(description="List of technologies used in the project.")
    url: Optional[str] = Field(None, description="Link to the project if provided.")

class ExtractedEducation(BaseModel):
    degree: str = Field(description="Degree obtained (e.g., B.S. Computer Science).")
    institution: str = Field(description="Name of the university or institution.")
    start_date: Optional[str] = Field(None, description="Start date.")
    end_date: Optional[str] = Field(None, description="End date or graduation date.")
    gpa: Optional[str] = Field(None, description="GPA if provided.")

class ExtractedResumeMetadata(BaseModel):
    summary: Optional[str] = Field(None, description="A brief professional summary extracted or inferred from the resume.")
    skills: List[ExtractedSkill] = Field(description="List of all skills extracted from the resume.")
    experience: List[ExtractedExperience] = Field(description="List of professional work experiences.")
    projects: List[ExtractedProject] = Field(description="List of notable projects.")
    education: List[ExtractedEducation] = Field(description="List of educational qualifications.")

class DeepResumeAnalysis(BaseModel):
    overall_score: int = Field(description="Overall resume score out of 100 based on impact, clarity, and skills.")
    ats_score: int = Field(description="Estimated ATS compatibility score out of 100.")
    technical_score: int = Field(description="Technical score out of 100 based on hard skills and projects.")
    communication_score: int = Field(description="Communication score out of 100 based on bullet point phrasing and clarity.")
    strengths: List[str] = Field(description="List of 3-5 key strengths of this candidate.")
    weaknesses: List[str] = Field(description="List of 2-4 critical weaknesses or areas for improvement.")
    skill_gap: List[str] = Field(description="List of highly sought-after industry skills missing from the resume.")
    missing_keywords: List[str] = Field(description="List of exact keywords missing that hurt ATS score.")
    career_trajectory: str = Field(description="A brief paragraph summarizing their career progression and trajectory.")
    recommendations: List[str] = Field(description="List of actionable recommendations to improve the resume or career readiness.")
    learning_roadmap: List[str] = Field(description="List of steps to upskill based on skill gaps.")
    interview_readiness: str = Field(description="Paragraph on how ready this candidate is for an interview and what to prepare.")
