# InterviewOS

> **The AI Operating System for Interview Success.**

InterviewOS is a production-grade SaaS platform that helps candidates master interviews through AI-powered mock interviews, coding challenges, resume intelligence, and real-time coaching.

## 🏗️ Architecture

```
InterviewOS/
├── apps/
│   ├── frontend/          # Next.js 15 (App Router, React 19, TypeScript)
│   └── backend/           # FastAPI (Python 3.12, SQLAlchemy 2.0, PostgreSQL)
├── packages/
│   ├── types/             # Shared TypeScript type definitions
│   ├── config/            # Shared configuration
│   └── utils/             # Shared utility functions
├── docker/                # Docker Compose & Dockerfiles
└── docs/                  # Architecture & setup documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Python** ≥ 3.11
- **Docker** & **Docker Compose**

### Frontend Development

```bash
cd apps/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Development

```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

### Docker (Full Stack)

```bash
docker compose -f docker/docker-compose.yml up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)
- DB Admin: [http://localhost:8080](http://localhost:8080) (dev profile)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Animation | Framer Motion, GSAP (sparingly) |
| Smooth Scroll | Lenis |
| State | Zustand, TanStack Query |
| Backend | FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose |

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)

## 📄 License

Proprietary — All rights reserved.
