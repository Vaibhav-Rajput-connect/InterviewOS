"""
Models package — import all models to register them with SQLAlchemy.
"""

from .user import User
from .profile import Profile
from .ai_memory import AIMemory
from .organization import Organization, OrganizationMember, OrganizationInvite
from .recruiting import Team, Pipeline, HiringStage, Candidate, CandidateNote, InterviewReport, Evaluation
from .audit import AuditLog
from .resume import (
    Resume,
    ResumeAnalysis,
    ResumeSection,
    ResumeSkill,
    ResumeExperience,
    ResumeEducation,
    ResumeProject,
    Technology,
    Embedding,
)
from .interview_engine import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewEvaluation,
    InterviewFeedback,
    InterviewSummary,
)
from .coding import (
    CodingProblem,
    UserProblemStatus,
    CodingSubmission,
    ProblemTag,
    ProblemCompany,
    SubmissionResult,
    ExecutionLog,
    CodingHint,
)
from .auth import Session, VerificationToken
from .activity import ActivityLog, Notification
from .gamification import Achievement, DailyGoal, UserStats

__all__ = [
    "User",
    "Profile",
    "AIMemory",
    "Organization",
    "OrganizationMember",
    "OrganizationInvite",
    "Team",
    "Pipeline",
    "HiringStage",
    "Candidate",
    "CandidateNote",
    "InterviewReport",
    "Evaluation",
    "AuditLog",
    "Resume",
    "InterviewSession",
    "InterviewQuestion",
    "InterviewAnswer",
    "InterviewEvaluation",
    "InterviewFeedback",
    "InterviewSummary",
    "Session",
    "VerificationToken",
    "ActivityLog",
    "Notification",
    "Achievement",
    "DailyGoal",
    "UserStats",
    "ResumeAnalysis",
    "ResumeSection",
    "ResumeSkill",
    "ResumeExperience",
    "ResumeEducation",
    "ResumeProject",
    "Technology",
    "Embedding",
    "CodingProblem",
    "UserProblemStatus",
    "CodingSubmission",
    "ProblemTag",
    "ProblemCompany",
    "SubmissionResult",
    "ExecutionLog",
    "CodingHint",
]

