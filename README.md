# InterviewOS

> **The AI Operating System for Interview Success.**

InterviewOS is a production-grade SaaS platform that acts as a central Intelligence Core, helping candidates master interviews through AI-powered mock interviews, coding challenges, resume intelligence, and real-time coaching.

## 🚀 Key Features Built

- **Google Nexus Authentication**: End-to-end secure OAuth pipeline handling real user sessions and PostgreSQL database sync.
- **The Command Center (Dashboard)**: A futuristic, glassmorphic UI system built with Tailwind CSS v4, Framer Motion, and CSS backdrops.
- **Resume Intelligence Lab**: Advanced drag-and-drop resume scanner interface built for AI metadata extraction.
- **AI Core Neural Sphere**: A highly optimized, interactive 3D WebGL neural sphere built on React Three Fiber running seamlessly in the background.
- **Dynamic API Layer**: Fully connected frontend-to-backend data hydration pulling live PostgreSQL statistics (XP, Streaks, Readiness Scores).
- **Algorithmic Optical Filter**: An innovative CSS global inversion system providing a mathematically cohesive light-mode aesthetic while locking in the dark "Intelligence Core" vibe.

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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Animation** | Framer Motion, GSAP (sparingly) |
| **Smooth Scroll** | Lenis |
| **State** | Zustand (Persisted Storage), TanStack Query |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL 16 (with pgvector support) |
| **Auth** | Authlib, Google OAuth 2.0 |
| **Infrastructure** | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Python** ≥ 3.11
- **Docker** & **Docker Compose**

### Full Stack (Docker)

1. Create a `.env` file in the root directory:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
2. Spin up the cluster:
   ```bash
   cd docker
   docker compose --env-file ../.env up -d --build
   ```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

### Local Frontend Development

```bash
cd apps/frontend
npm install
npm run dev
```

### Local Backend Development

```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)

## 📄 License

Proprietary — All rights reserved.
