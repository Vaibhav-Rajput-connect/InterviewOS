
CREATE TABLE users (
	id UUID NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255), 
	full_name VARCHAR(255) NOT NULL, 
	avatar_url VARCHAR(512), 
	is_active BOOLEAN NOT NULL, 
	is_verified BOOLEAN NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
)

;
CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE organizations (
	id UUID NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	slug VARCHAR(255) NOT NULL, 
	logo_url VARCHAR(512), 
	website VARCHAR(512), 
	industry VARCHAR(255), 
	size VARCHAR(50), 
	description TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
)

;
CREATE UNIQUE INDEX ix_organizations_slug ON organizations (slug);

CREATE TABLE technologies (
	id UUID NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	category VARCHAR(100), 
	PRIMARY KEY (id), 
	UNIQUE (name)
)

;

CREATE TABLE coding_problems (
	id UUID NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	slug VARCHAR(255) NOT NULL, 
	difficulty VARCHAR(50) NOT NULL, 
	description TEXT NOT NULL, 
	constraints JSON, 
	examples JSON, 
	test_cases JSON, 
	boilerplate JSON, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
)

;
CREATE UNIQUE INDEX ix_coding_problems_slug ON coding_problems (slug);

CREATE TABLE profiles (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	"current_role" VARCHAR(255), 
	years_of_experience INTEGER, 
	current_company VARCHAR(255), 
	target_role VARCHAR(255), 
	target_companies VARCHAR[], 
	skills VARCHAR[], 
	interview_types VARCHAR[], 
	preparation_goal VARCHAR(255), 
	weekly_target_hours INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

CREATE TABLE ai_memories (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	memory_type VARCHAR(50) NOT NULL, 
	content TEXT NOT NULL, 
	meta_data JSON, 
	embedding VECTOR(768) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX hnsw_index ON ai_memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ix_ai_memories_user_id ON ai_memories (user_id);
CREATE INDEX ix_ai_memories_memory_type ON ai_memories (memory_type);

CREATE TABLE organization_members (
	id UUID NOT NULL, 
	organization_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	invited_by UUID, 
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_org_member UNIQUE (organization_id, user_id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_organization_members_user_id ON organization_members (user_id);
CREATE INDEX ix_organization_members_organization_id ON organization_members (organization_id);

CREATE TABLE organization_invites (
	id UUID NOT NULL, 
	organization_id UUID NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	token VARCHAR(255) NOT NULL, 
	invited_by UUID NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	accepted_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_organization_invites_organization_id ON organization_invites (organization_id);
CREATE INDEX ix_organization_invites_email ON organization_invites (email);
CREATE UNIQUE INDEX ix_organization_invites_token ON organization_invites (token);

CREATE TABLE teams (
	id UUID NOT NULL, 
	organization_id UUID NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_teams_organization_id ON teams (organization_id);

CREATE TABLE audit_logs (
	id UUID NOT NULL, 
	user_id UUID, 
	organization_id UUID, 
	action VARCHAR(255) NOT NULL, 
	resource_id VARCHAR(255), 
	details JSONB, 
	ip_address VARCHAR(45), 
	timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL, 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE SET NULL
)

;
CREATE INDEX ix_audit_logs_organization_id ON audit_logs (organization_id);
CREATE INDEX ix_audit_logs_action ON audit_logs (action);
CREATE INDEX ix_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX ix_audit_logs_resource_id ON audit_logs (resource_id);
CREATE INDEX ix_audit_logs_timestamp ON audit_logs (timestamp);

CREATE TABLE resumes (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	content TEXT, 
	file_url VARCHAR(512), 
	file_type VARCHAR(50), 
	is_parsed BOOLEAN NOT NULL, 
	parsing_status VARCHAR(50), 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

CREATE TABLE problem_tags (
	id UUID NOT NULL, 
	problem_id UUID NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_problem_tags_problem_id ON problem_tags (problem_id);

CREATE TABLE problem_companies (
	id UUID NOT NULL, 
	problem_id UUID NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_problem_companies_problem_id ON problem_companies (problem_id);

CREATE TABLE user_problem_statuses (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	problem_id UUID NOT NULL, 
	status VARCHAR(50), 
	bookmarked BOOLEAN, 
	last_attempted_at TIMESTAMP WITH TIME ZONE, 
	solved_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_user_problem_statuses_problem_id ON user_problem_statuses (problem_id);
CREATE INDEX ix_user_problem_statuses_user_id ON user_problem_statuses (user_id);

CREATE TABLE coding_submissions (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	problem_id UUID NOT NULL, 
	code TEXT NOT NULL, 
	language VARCHAR(50) NOT NULL, 
	status VARCHAR(50), 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_coding_submissions_problem_id ON coding_submissions (problem_id);
CREATE INDEX ix_coding_submissions_user_id ON coding_submissions (user_id);

CREATE TABLE coding_hints (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	problem_id UUID NOT NULL, 
	code_snapshot TEXT, 
	hint_text TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_coding_hints_problem_id ON coding_hints (problem_id);
CREATE INDEX ix_coding_hints_user_id ON coding_hints (user_id);

CREATE TABLE sessions (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	refresh_token VARCHAR(512) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	user_agent VARCHAR(255), 
	ip_address VARCHAR(45), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE UNIQUE INDEX ix_sessions_refresh_token ON sessions (refresh_token);
CREATE INDEX ix_sessions_user_id ON sessions (user_id);

CREATE TABLE verification_tokens (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	token VARCHAR(255) NOT NULL, 
	token_type VARCHAR(50) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE UNIQUE INDEX ix_verification_tokens_token ON verification_tokens (token);
CREATE INDEX ix_verification_tokens_user_id ON verification_tokens (user_id);

CREATE TABLE activity_logs (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	action VARCHAR NOT NULL, 
	details JSON, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_activity_logs_user_id ON activity_logs (user_id);

CREATE TABLE notifications (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	type VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	message TEXT NOT NULL, 
	is_read BOOLEAN, 
	action_url VARCHAR, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_notifications_user_id ON notifications (user_id);

CREATE TABLE achievements (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	title VARCHAR NOT NULL, 
	description VARCHAR, 
	icon VARCHAR, 
	unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_achievements_user_id ON achievements (user_id);

CREATE TABLE daily_goals (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	goal_type VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	target INTEGER, 
	progress INTEGER, 
	is_completed BOOLEAN, 
	date DATE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_daily_goals_user_id ON daily_goals (user_id);

CREATE TABLE user_stats (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	level INTEGER, 
	xp INTEGER, 
	interview_streak INTEGER, 
	readiness_score FLOAT, 
	coding_progress FLOAT, 
	updated_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

CREATE TABLE pipelines (
	id UUID NOT NULL, 
	organization_id UUID NOT NULL, 
	team_id UUID, 
	title VARCHAR(255) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
	FOREIGN KEY(team_id) REFERENCES teams (id) ON DELETE SET NULL
)

;
CREATE INDEX ix_pipelines_organization_id ON pipelines (organization_id);

CREATE TABLE resume_analysis (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	overall_score INTEGER, 
	ats_score INTEGER, 
	technical_score INTEGER, 
	communication_score INTEGER, 
	summary TEXT, 
	strengths JSON, 
	weaknesses JSON, 
	recommendations JSON, 
	career_trajectory TEXT, 
	skill_gap JSON, 
	missing_keywords JSON, 
	learning_roadmap JSON, 
	interview_readiness TEXT, 
	company_match_scores JSON, 
	rewrite_suggestions JSON, 
	project_quality JSON, 
	technology_coverage JSON, 
	industry_recommendations JSON, 
	career_recommendations JSON, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (resume_id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE resume_sections (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	section_type VARCHAR(100) NOT NULL, 
	content TEXT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE resume_skills (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	technology_id UUID, 
	name VARCHAR(100) NOT NULL, 
	proficiency VARCHAR(50), 
	years_experience FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE, 
	FOREIGN KEY(technology_id) REFERENCES technologies (id) ON DELETE SET NULL
)

;

CREATE TABLE resume_experiences (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	company_name VARCHAR(255) NOT NULL, 
	role VARCHAR(255) NOT NULL, 
	start_date VARCHAR(50), 
	end_date VARCHAR(50), 
	description TEXT, 
	highlights JSON, 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE resume_educations (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	institution VARCHAR(255) NOT NULL, 
	degree VARCHAR(255) NOT NULL, 
	field_of_study VARCHAR(255), 
	start_date VARCHAR(50), 
	end_date VARCHAR(50), 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE resume_projects (
	id UUID NOT NULL, 
	resume_id UUID NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	description TEXT, 
	url VARCHAR(512), 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE embeddings (
	id UUID NOT NULL, 
	resume_id UUID, 
	chunk_text TEXT NOT NULL, 
	chunk_index INTEGER NOT NULL, 
	embedding VECTOR(768) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE
)

;

CREATE TABLE interview_sessions (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	resume_id UUID, 
	target_role VARCHAR(255), 
	target_company VARCHAR(255), 
	difficulty VARCHAR(50) NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	started_at TIMESTAMP WITH TIME ZONE, 
	completed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE SET NULL
)

;

CREATE TABLE submission_results (
	id UUID NOT NULL, 
	submission_id UUID NOT NULL, 
	correctness_score INTEGER, 
	code_quality_score INTEGER, 
	time_complexity VARCHAR(100), 
	space_complexity VARCHAR(100), 
	readability_feedback TEXT, 
	best_practices_feedback TEXT, 
	edge_case_feedback TEXT, 
	optimization_suggestions TEXT, 
	PRIMARY KEY (id), 
	UNIQUE (submission_id), 
	FOREIGN KEY(submission_id) REFERENCES coding_submissions (id) ON DELETE CASCADE
)

;

CREATE TABLE execution_logs (
	id UUID NOT NULL, 
	submission_id UUID NOT NULL, 
	stdout TEXT, 
	stderr TEXT, 
	exit_code INTEGER, 
	time_ms INTEGER, 
	memory_kb INTEGER, 
	pass_count INTEGER, 
	fail_count INTEGER, 
	total_cases INTEGER, 
	status VARCHAR(100), 
	PRIMARY KEY (id), 
	UNIQUE (submission_id), 
	FOREIGN KEY(submission_id) REFERENCES coding_submissions (id) ON DELETE CASCADE
)

;

CREATE TABLE hiring_stages (
	id UUID NOT NULL, 
	pipeline_id UUID NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	"order" INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(pipeline_id) REFERENCES pipelines (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_hiring_stages_pipeline_id ON hiring_stages (pipeline_id);

CREATE TABLE resume_experience_technologies (
	id UUID NOT NULL, 
	experience_id UUID NOT NULL, 
	technology_id UUID NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(experience_id) REFERENCES resume_experiences (id) ON DELETE CASCADE, 
	FOREIGN KEY(technology_id) REFERENCES technologies (id) ON DELETE CASCADE
)

;

CREATE TABLE resume_project_technologies (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	technology_id UUID NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES resume_projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(technology_id) REFERENCES technologies (id) ON DELETE CASCADE
)

;

CREATE TABLE interview_questions (
	id UUID NOT NULL, 
	session_id UUID NOT NULL, 
	"order" INTEGER NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	content TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
)

;

CREATE TABLE interview_feedbacks (
	id UUID NOT NULL, 
	session_id UUID NOT NULL, 
	technical_feedback TEXT, 
	communication_feedback TEXT, 
	overall_impression TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (session_id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
)

;

CREATE TABLE interview_summaries (
	id UUID NOT NULL, 
	session_id UUID NOT NULL, 
	overall_score FLOAT, 
	technical_score FLOAT, 
	behavioral_score FLOAT, 
	communication_score FLOAT, 
	strengths TEXT, 
	weaknesses TEXT, 
	recommended_topics TEXT, 
	next_learning_plan TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (session_id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
)

;

CREATE TABLE full_evaluations (
	id UUID NOT NULL, 
	session_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	overall_score INTEGER NOT NULL, 
	technical_score INTEGER NOT NULL, 
	coding_score INTEGER NOT NULL, 
	communication_score INTEGER NOT NULL, 
	confidence_score INTEGER NOT NULL, 
	problem_solving_score INTEGER NOT NULL, 
	system_design_score INTEGER NOT NULL, 
	behavioral_score INTEGER NOT NULL, 
	detailed_feedback TEXT, 
	strengths JSON, 
	weaknesses JSON, 
	improvement_suggestions JSON, 
	learning_recommendations JSON, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (session_id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

CREATE TABLE candidates (
	id UUID NOT NULL, 
	organization_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	pipeline_id UUID NOT NULL, 
	current_stage_id UUID NOT NULL, 
	applied_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	is_archived BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_pipeline_candidate UNIQUE (pipeline_id, user_id), 
	FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(pipeline_id) REFERENCES pipelines (id) ON DELETE CASCADE, 
	FOREIGN KEY(current_stage_id) REFERENCES hiring_stages (id) ON DELETE RESTRICT
)

;
CREATE INDEX ix_candidates_pipeline_id ON candidates (pipeline_id);
CREATE INDEX ix_candidates_is_archived ON candidates (is_archived);
CREATE INDEX ix_candidates_user_id ON candidates (user_id);
CREATE INDEX ix_candidates_organization_id ON candidates (organization_id);

CREATE TABLE interview_answers (
	id UUID NOT NULL, 
	question_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	content TEXT NOT NULL, 
	audio_url VARCHAR(512), 
	transcription TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (question_id), 
	FOREIGN KEY(question_id) REFERENCES interview_questions (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

CREATE TABLE candidate_notes (
	id UUID NOT NULL, 
	candidate_id UUID NOT NULL, 
	author_id UUID, 
	content TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id) ON DELETE CASCADE, 
	FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
)

;
CREATE INDEX ix_candidate_notes_candidate_id ON candidate_notes (candidate_id);

CREATE TABLE interview_reports (
	id UUID NOT NULL, 
	candidate_id UUID NOT NULL, 
	stage_id UUID NOT NULL, 
	overall_score INTEGER NOT NULL, 
	recommendation VARCHAR(50) NOT NULL, 
	summary TEXT NOT NULL, 
	ai_feedback TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id) ON DELETE CASCADE, 
	FOREIGN KEY(stage_id) REFERENCES hiring_stages (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_interview_reports_candidate_id ON interview_reports (candidate_id);

CREATE TABLE interview_evaluations (
	id UUID NOT NULL, 
	answer_id UUID NOT NULL, 
	overall_score FLOAT, 
	technical_accuracy FLOAT, 
	communication FLOAT, 
	confidence FLOAT, 
	completeness FLOAT, 
	suggestions TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (answer_id), 
	FOREIGN KEY(answer_id) REFERENCES interview_answers (id) ON DELETE CASCADE
)

;

CREATE TABLE evaluations (
	id UUID NOT NULL, 
	report_id UUID NOT NULL, 
	category VARCHAR(255) NOT NULL, 
	score INTEGER NOT NULL, 
	feedback TEXT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(report_id) REFERENCES interview_reports (id) ON DELETE CASCADE
)

;
CREATE INDEX ix_evaluations_report_id ON evaluations (report_id);
