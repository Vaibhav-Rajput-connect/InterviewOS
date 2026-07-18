# System Design Notes

## Core Architectural Principles

1.  **Frontend/Backend Decoupling**
    *   **Frontend**: Next.js 16 handles purely presentation, routing, state, and 3D rendering. It remains stateless with respect to business logic.
    *   **Backend**: FastAPI acts as the strict intelligence and data broker.

2.  **Stateless AI Processing (RAG)**
    *   AI processing is expensive and unpredictable.
    *   **Pattern used**: The backend uses an async task offloading model for heavy AI operations (like resume parsing or holistic evaluations). Next.js uses TanStack Query to poll or listen for completion states from PostgreSQL.

3.  **Real-Time Data Model**
    *   The `coding_sessions` and `interview_sessions` tables store live progression.
    *   WebSockets or aggressive client-side polling keeps the UI synchronized.

4.  **Database Strategy**
    *   **Neon Serverless PostgreSQL**: Handles connection pooling intrinsically and scales to 0 when inactive, drastically reducing costs.
    *   **pgvector**: Powers the RAG (Retrieval-Augmented Generation) pipeline, storing 768-dimensional embeddings of user skills to accurately query similar interview questions.

## Failure Modes & Resilience

*   **Database Disconnection**: If Neon goes to sleep, the first request might take ~2-3 seconds to cold start. The backend is configured to use an async SQLAlchemy engine with connection retries.
*   **Gemini API Rate Limiting**: AI calls are wrapped in a `tenacity` retry block with exponential backoff (`gateway.py`) to prevent 429 Too Many Requests errors from halting an interview.
*   **Security Validation**: Input validation and schema matching are enforced strictly by Pydantic models before data ever reaches the AI context window, protecting against prompt injection and algorithmic complexity attacks.
