# InterviewOS — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.0.0 | Frontend runtime |
| Python | ≥ 3.11 | Backend runtime |
| Docker | Latest | Containerization |
| Docker Compose | v2+ | Service orchestration |

## Environment Variables

Copy the example environment files:

```bash
# Root
cp .env.example .env

# Backend
cp apps/backend/.env.example apps/backend/.env
```

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Backend API URL |
| `DATABASE_URL` | `postgresql+asyncpg://interviewos:interviewos_secret@localhost:5432/interviewos` | PostgreSQL connection |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |
| `POSTGRES_USER` | `interviewos` | Database user |
| `POSTGRES_PASSWORD` | `interviewos_secret` | Database password |
| `POSTGRES_DB` | `interviewos` | Database name |

## Option 1: Docker (Recommended)

The simplest way to run the full stack:

```bash
# Start all services
docker compose -f docker/docker-compose.yml up --build

# Start with dev tools (includes Adminer)
docker compose -f docker/docker-compose.yml --profile dev up --build

# Stop all services
docker compose -f docker/docker-compose.yml down

# Reset database
docker compose -f docker/docker-compose.yml down -v
```

## Option 2: Local Development

### Frontend

```bash
cd apps/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Backend

```bash
cd apps/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Start PostgreSQL (Docker)
docker run -d \
  --name interviewos-db \
  -e POSTGRES_USER=interviewos \
  -e POSTGRES_PASSWORD=interviewos_secret \
  -e POSTGRES_DB=interviewos \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

## Database Migrations

```bash
cd apps/backend

# Create a new migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

## Verification

After starting all services, verify:

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | http://localhost:3000 | Landing page with 3D scene |
| Backend API | http://localhost:8000/api/v1/health | `{"status": "healthy"}` |
| API Docs | http://localhost:8000/api/v1/docs | Swagger UI |
| DB Admin | http://localhost:8080 | Adminer login (dev profile only) |
