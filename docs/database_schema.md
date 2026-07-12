# InterviewOS Database Schema & ERD

## Overview
InterviewOS utilizes a highly normalized PostgreSQL schema with pgvector extensions for AI-driven dense retrieval.

## Core Entities

### Users
- `users`: Core identity table.

### Resume Intelligence
- `resumes`: The core document uploaded by the user.
- `resume_analysis`: AI-generated deep analysis containing scores (ATS, Technical, Overall) and qualitative text arrays (strengths, weaknesses, etc.).
  - *Relationship*: 1:1 with `resumes` (cascading delete).
- `resume_sections`: Raw extracted section chunks.
- `resume_skills`: AI-mapped skills with proficiency and experience years.
- `resume_experiences`: Work history entries.
- `resume_educations`: Educational background.
- `resume_projects`: Personal or professional projects.

### Technology Graph
- `technologies`: Global dictionary of canonical skills/tools (e.g., "Python", "React").
- `resume_experience_technologies`: Many-to-many junction linking Experiences to Technologies.
- `resume_project_technologies`: Many-to-many junction linking Projects to Technologies.
- *Note*: `resume_skills` also contains an optional `technology_id` foreign key.

### Embeddings
- `embeddings`: pgvector-enabled table storing 768-dimensional text embeddings for chunks of the resume.

## Cascading Behaviors
All dependent child tables (e.g., Analysis, Experiences, Skills, Embeddings) are configured with `ondelete="CASCADE"`. Deleting a `User` cascades to all `Resumes`. Deleting a `Resume` deletes all nested AI extractions and embeddings automatically.
