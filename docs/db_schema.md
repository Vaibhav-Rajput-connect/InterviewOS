# Database Schema Documentation

InterviewOS utilizes a highly normalized PostgreSQL schema built using SQLAlchemy and Alembic.

## Core Tables

### 1. `users`
- Stores authentication and identity details for end-users.
- Managed primarily through `AuthService`.

### 2. `resumes`
- Core entity representing an uploaded resume.
- Fields: `file_url`, `file_type`, `content` (raw extracted text), `parsing_status`, `is_parsed`.
- Cascades deletions to all child analysis records.

### 3. `resume_analysis`
- 1:1 Relationship with `resumes`.
- Stores the deep AI evaluation of the resume.
- Fields: `overall_score`, `ats_score`, `technical_score`, `communication_score`, `strengths` (JSON), `weaknesses` (JSON), `learning_roadmap` (JSON), `skill_gap` (JSON), `missing_keywords` (JSON), `interview_readiness` (Text), `career_trajectory` (Text), `recommendations` (JSON), `summary` (Text).

### 4. `technologies`
- Global taxonomy of technologies.
- AI extracts raw tech names (e.g., "react", "React.js") and normalizes them.
- Serves as the backbone for cross-referencing user skills with job requirements.

### 5. `resume_skills`
- Links a `Resume` to a `Technology`.
- Adds context: `proficiency`, `years_experience`.

### 6. `resume_experiences`
- Represents a job or role in the resume.
- Fields: `company_name`, `role`, `start_date`, `end_date`, `description`.
- Many-to-Many linked to `technologies` via `resume_experience_technologies`.

### 7. `resume_projects`
- Represents a side project or professional project.
- Fields: `name`, `description`, `url`.
- Many-to-Many linked to `technologies` via `resume_project_technologies`.

### 8. `resume_educations`
- Represents academic background.
- Fields: `institution`, `degree`, `field_of_study`, `start_date`, `end_date`.

### 9. `embeddings`
- Stores semantic vector representations.
- Uses `pgvector` (`VECTOR(768)`).
- Fields: `resume_id`, `chunk_text`, `chunk_index`, `embedding`.
- Enables high-performance Retrieval-Augmented Generation (RAG).
