import os
from sqlalchemy import create_engine
from app.db.base import Base

# Import all models to ensure they are registered
from app.models import (
    User, Profile, Resume, InterviewSession, InterviewQuestion, InterviewAnswer,
    InterviewEvaluation, InterviewFeedback, InterviewSummary,
    CodingProblem, UserProblemStatus, CodingSubmission, ProblemTag, ProblemCompany, SubmissionResult, ExecutionLog, CodingHint,
    Session, VerificationToken, ActivityLog, Notification,
    Achievement, DailyGoal, UserStats, ResumeAnalysis, ResumeSection,
    ResumeSkill, ResumeExperience, ResumeEducation, ResumeProject,
    Technology, Embedding
)

def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set")
        return
        
    engine = create_engine(db_url)
    print("Creating missing tables...")
    Base.metadata.create_all(engine)
    print("Done!")

if __name__ == "__main__":
    main()
