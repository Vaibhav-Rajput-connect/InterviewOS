# InterviewOS

> **The AI Operating System for Interview Success and Technical Recruitment.**

InterviewOS is a production-grade SaaS platform acting as a central Intelligence Core. It helps candidates master interviews through AI-powered mock interviews, coding challenges, resume intelligence, and real-time coaching, while providing recruiters with deep analytics and candidate evaluation pipelines.

---

## 🚀 Key Features

- **Google Nexus Authentication**: End-to-end secure OAuth pipeline handling real user sessions and PostgreSQL database sync.
- **The Command Center**: A futuristic, glassmorphic UI system built with Tailwind CSS v4, Framer Motion, and CSS backdrops.
- **Resume Intelligence Lab**: Advanced drag-and-drop resume scanner interface built for AI metadata extraction, scoring, and matching.
- **AI Core Neural Sphere**: A highly optimized, interactive 3D WebGL neural sphere built on React Three Fiber running seamlessly in the background.
- **Algorithmic Coding Arena**: Collaborative, real-time code editor built on Monaco with instant execution feedback.
- **Recruiter Dashboard**: Complete pipeline management, organizational charting, and candidate analytics.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **State Management** | Zustand (Persisted Storage), TanStack Query |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic |
| **Database** | Neon PostgreSQL (Serverless) |
| **AI Models** | Google Gemini (Embeddings, RAG, Generation) |
| **Testing** | Vitest (Unit), Playwright (E2E), Pytest (Backend) |
| **Infrastructure** | Vercel (Frontend), Render (Backend), GitHub Actions (CI) |

---

## 🏗️ Architecture Diagrams

### High-Level Architecture
```mermaid
graph TD
    Client[Web Client - Next.js] -->|HTTPS REST| Vercel[Vercel Edge CDN]
    Vercel -->|API Calls| Render[Render FastAPI Backend]
    
    Render -->|SQLAlchemy Async| DB[(Neon PostgreSQL)]
    Render -->|REST API| Gemini[Google Gemini AI]
    
    subgraph Frontend [Next.js Application]
        UI[UI Components]
        State[Zustand / React Query]
        WebGL[React Three Fiber]
    end
    
    subgraph Backend [FastAPI Service]
        Auth[OAuth & Security]
        AI[AI Gateway & RAG]
        Core[Core API Endpoints]
    end
```

### Database ER Diagram (Core)
```mermaid
erDiagram
    USERS ||--o{ RESUMES : owns
    USERS ||--o{ INTERVIEW_SESSIONS : conducts
    USERS ||--o{ CODE_SUBMISSIONS : creates
    
    ORGANIZATIONS ||--o{ ORG_MEMBERS : has
    ORG_MEMBERS }o--|| USERS : is_a
    
    RESUMES ||--o{ RESUME_ANALYSIS : analyzed_by
    RESUMES ||--o{ RESUME_SKILLS : contains
    
    INTERVIEW_SESSIONS ||--o{ INTERVIEW_QUESTIONS : has
```

### AI RAG Architecture
```mermaid
flowchart LR
    Upload[Resume Upload] --> Parse[Text Extraction]
    Parse --> AI[Gemini 1.5 Pro]
    AI --> Structure[JSON Schema Enforcement]
    Structure --> Embed[Gemini Embeddings]
    Embed --> VectorDB[(PostgreSQL pgvector)]
    
    Query[Interview Setup] --> Retrieve[Similarity Search]
    Retrieve --> Context[Prompt Context]
    Context --> Generation[Dynamic Question Generation]
```

---

## 📂 Folder Structure

```text
InterviewOS/
├── apps/
│   ├── frontend/          # Next.js Application (Vercel)
│   │   ├── src/app/       # App Router Pages
│   │   ├── src/components/# Shared UI Components
│   │   └── e2e/           # Playwright End-to-End Tests
│   └── backend/           # FastAPI Application (Render)
│       ├── app/api/       # REST Endpoints
│       ├── app/core/      # Security, Config, DB Engine
│       ├── app/models/    # SQLAlchemy ORM Models
│       ├── app/services/  # AI Gateway & Pipelines
│       └── tests/         # Pytest Test Suites
├── docs/                  # Architecture & Setup Documentation
├── packages/              # Shared Monorepo Tooling
├── render.yaml            # Render Deployment Spec
└── .github/workflows/     # CI/CD Pipelines
```

---

## ⚙️ Installation & Local Development

### Prerequisites
- Node.js ≥ 20.0
- Python ≥ 3.11
- Local PostgreSQL or Neon DB URL

### 1. Backend Setup
```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Configure `.env`:
```env
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=your-secure-secret
ENVIRONMENT=development
GEMINI_API_KEY=your-gemini-key
```

Apply migrations and run:
```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd apps/frontend
npm ci
```

Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the development server:
```bash
npm run dev
```

---

## 🚀 Deployment

**Frontend (Vercel)**
- Connect repository to Vercel.
- Framework Preset: Next.js.
- Ensure `NEXT_PUBLIC_API_URL` points to your production backend.

**Backend (Render)**
- Connect repository to Render.
- Deployment defined via `render.yaml`.
- Required Env Vars: `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`.

**Database (Neon)**
- Create a Neon PostgreSQL instance.
- Enable the `pgvector` extension if semantic search is required.
- Paste connection string into the Render Dashboard.

---

## 🛣️ Future Roadmap
- [ ] Redis caching for frequent RAG retrievals.
- [ ] Multi-language code execution environments (Docker sandboxing).
- [ ] Advanced behavioral analytics using voice tone analysis.
- [ ] Calendar integration for recruiter scheduling.

---

## 📄 License
This project is proprietary and confidential. Unauthorized copying, distribution, or reverse-engineering is strictly prohibited.
