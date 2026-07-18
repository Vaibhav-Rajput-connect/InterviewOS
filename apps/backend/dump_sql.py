from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable
from app.db.base import Base
# Import all models
from app.models import (
    User, Profile, Resume, InterviewSession, InterviewQuestion, InterviewAnswer,
    InterviewEvaluation, InterviewFeedback, InterviewSummary,
    CodingProblem, UserProblemStatus, CodingSubmission, ProblemTag, ProblemCompany, SubmissionResult, ExecutionLog, CodingHint,
    Session, VerificationToken, ActivityLog, Notification,
    Achievement, DailyGoal, UserStats, ResumeAnalysis, ResumeSection,
    ResumeSkill, ResumeExperience, ResumeEducation, ResumeProject,
    Technology, Embedding
)

def dump(sql, *multiparams, **params):
    print(sql.compile(dialect=engine.dialect))

engine = create_engine('postgresql://')
with open("schema.sql", "w") as f:
    def dump_to_file(sql, *multiparams, **params):
        f.write(str(sql.compile(dialect=engine.dialect)) + ";\n")
        
    engine = create_engine('postgresql://', strategy='mock', executor=dump_to_file)
    Base.metadata.create_all(engine)
