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

class GeneratedQuestion(BaseModel):
    content: str = Field(description="The actual question text spoken by the interviewer.")
    category: str = Field(description="The category of the question (e.g. behavioral, technical, system_design).")
    expected_points: List[str] = Field(description="A list of key points or criteria you expect the candidate to cover in their answer.")

class AnswerEvaluationResult(BaseModel):
    overall_score: float = Field(description="Overall score out of 100 based on the quality of the answer.")
    technical_accuracy: float = Field(description="Score out of 100 for technical correctness.")
    communication: float = Field(description="Score out of 100 for clarity, structure, and communication.")
    confidence: float = Field(description="Score out of 100 for perceived confidence in the answer.")
    completeness: float = Field(description="Score out of 100 based on how well the candidate covered the expected points.")
    suggestions: str = Field(description="Specific feedback and actionable suggestions for improving the answer.")

class SessionSummaryResult(BaseModel):
    overall_score: float = Field(description="Final aggregate score out of 100 for the entire interview.")
    technical_score: float = Field(description="Final technical score out of 100.")
    behavioral_score: float = Field(description="Final behavioral/cultural score out of 100.")
    communication_score: float = Field(description="Final communication score out of 100.")
    strengths: List[str] = Field(description="Top 3 to 5 strengths demonstrated by the candidate.")
    weaknesses: List[str] = Field(description="Top 3 to 5 areas of weakness or missing knowledge.")
    recommended_topics: List[str] = Field(description="Specific topics the candidate should study or practice before a real interview.")
    next_learning_plan: str = Field(description="A concise, actionable learning plan summarizing how the candidate can improve.")

# ==========================================
# Coding Assistant Schemas
# ==========================================

class GeneratedHint(BaseModel):
    title: str = Field(description="Short title for the hint (e.g., 'Hint 1').")
    content: str = Field(description="The hint content, keeping it progressive and not revealing the full solution.")

class GeneratedHintList(BaseModel):
    hints: List[GeneratedHint] = Field(description="List of progressive hints for the coding problem.")

class ComplexityAnalysisResult(BaseModel):
    time_complexity: str = Field(description="Big-O notation for time complexity (e.g. O(N)).")
    space_complexity: str = Field(description="Big-O notation for space complexity (e.g. O(1)).")
    time_reasoning: str = Field(description="Brief explanation of why the time complexity is what it is.")
    space_reasoning: str = Field(description="Brief explanation of why the space complexity is what it is.")
    overall_feedback: str = Field(description="One sentence overall feedback on efficiency.")
