# InterviewOS - AI Interview Engine Documentation

## 1. Interview Engine Architecture

The AI Interview Engine is built on a scalable, stateful pipeline that leverages Next.js on the frontend and FastAPI on the backend. The core AI logic operates via a unified `AIGateway`, ensuring abstraction from direct LLM provider calls.

```mermaid
graph TD
    Client["Client (Next.js & Three.js)"]
    API["FastAPI Interview Endpoints"]
    DB[("PostgreSQL Database")]
    AIGateway["AI Gateway (Singleton)"]
    PromptMgr["Prompt Manager"]
    LLM["LLM Provider (Gemini)"]
    
    Client -->|HTTP REST| API
    API <-->|SQLAlchemy| DB
    API -->|Generate/Evaluate| AIGateway
    AIGateway -->|Inject Context| PromptMgr
    PromptMgr --> AIGateway
    AIGateway -->|API Call| LLM
```

## 2. Database Schema

The Interview Engine introduces 5 primary normalized tables to track the entire state of an interview.

```mermaid
erDiagram
    InterviewSession ||--o{ InterviewQuestion : contains
    InterviewSession ||--o| InterviewSummary : concludes
    InterviewQuestion ||--o| InterviewAnswer : has
    InterviewAnswer ||--o| InterviewEvaluation : receives

    InterviewSession {
        UUID id PK
        UUID user_id FK
        UUID resume_id FK
        String target_company
        String target_role
        String difficulty
        String status
        DateTime created_at
        DateTime completed_at
    }

    InterviewQuestion {
        UUID id PK
        UUID session_id FK
        Integer order
        String category
        Text content
        DateTime created_at
    }

    InterviewAnswer {
        UUID id PK
        UUID question_id FK
        UUID user_id FK
        Text content
        String audio_url
        DateTime created_at
    }

    InterviewEvaluation {
        UUID id PK
        UUID answer_id FK
        Integer overall_score
        Integer technical_accuracy
        Integer communication
        Integer confidence
        Integer completeness
        Text suggestions
    }
    
    InterviewSummary {
        UUID id PK
        UUID session_id FK
        Integer overall_score
        Integer technical_score
        Integer behavioral_score
        Integer communication_score
        JSON strengths
        JSON weaknesses
        JSON recommended_topics
        Text next_learning_plan
    }
```

## 3. API Documentation

All endpoints are rate-limited and secured via `CurrentUser` dependencies.

| Endpoint | Method | Rate Limit | Purpose |
|----------|--------|------------|---------|
| `/api/v1/interview/start` | POST | 10/min | Initializes a new `InterviewSession`. Payload: `resume_id`, `target_role`, `target_company`, `difficulty`, `interview_type`, `duration_minutes`. |
| `/api/v1/interview/sessions/{session_id}/next-question` | POST | 20/min | Compiles resume context and interview transcript history to generate a contextually-aware next question via AI Gateway. |
| `/api/v1/interview/answer` | POST | 20/min | Submits candidate answer to a specific question, persists to DB, and requests AI evaluation of the answer. Payload: `session_id`, `question_id`, `content`. |
| `/api/v1/interview/end` | POST | 10/min | Marks the session as completed and compiles the entire transcript to generate the `InterviewSummary`. |
| `/api/v1/interview/history` | GET | 30/min | Retrieves all past sessions for the authenticated user. |
| `/api/v1/interview/{session_id}` | GET | 60/min | Fetches specific session details and its associated questions/answers. |
| `/api/v1/interview/summary/{session_id}` | GET | 30/min | Fetches the comprehensive final feedback report for a completed session. |

## 4. Sequence Diagram: Dynamic Questioning

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant AI as AIGateway
    participant LLM as Provider

    C->>API: POST /sessions/{id}/next-question
    API->>DB: Fetch Session, History, & Resume Context
    DB-->>API: Data returned
    API->>AI: generate_interview_question(context, history)
    AI->>LLM: Structured Output Prompt
    LLM-->>AI: JSON Response
    AI-->>API: GeneratedQuestion Object
    API->>DB: Insert InterviewQuestion
    DB-->>API: Success
    API-->>C: Returns new question JSON
```

## 5. Folder Structure

Relevant components for the Interview Engine:

```text
InterviewOS/
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/
│   │   │   │   └── interview.py       # Interview Engine REST Controllers
│   │   │   ├── models/
│   │   │   │   └── interview_engine.py # SQLAlchemy ORM Models
│   │   │   └── services/ai/
│   │   │       ├── gateway.py         # Unified AI abstraction layer
│   │   │       ├── schemas.py         # Pydantic structured output models
│   │   │       └── prompts/
│   │   │           └── interview/     # Plaintext prompt templates
│   ├── frontend/
│   │   └── src/
│   │       ├── app/(dashboard)/
│   │       │   └── interview/         # Interview configuration & UI pages
│   │       └── components/
│   │           └── interview/         # Video, transcript, and evaluation components
```

## 6. Future Voice Architecture

The current engine utilizes standard HTTP REST for turn-based text/audio communication. To achieve true real-time, low-latency conversational AI (simulating a human perfectly), the architecture will evolve to a **Streaming Voice Architecture**.

```mermaid
graph TD
    Client["Browser (WebRTC/MediaRecorder)"]
    WSS["WebSocket Server (FastAPI/Socket.io)"]
    STT["Speech-to-Text (Streaming)"]
    LLM["LLM (Streaming Output)"]
    TTS["Text-to-Speech (Streaming)"]
    
    Client -->|Audio Chunks| WSS
    WSS -->|Stream| STT
    STT -->|Partial Transcripts| LLM
    LLM -->|Tokens| TTS
    TTS -->|Audio Bytes| WSS
    WSS -->|Audio Chunks| Client
```

### Key Upgrades Required:
1. **WebSocket Integration:** Transition from polling REST APIs to persistent duplex WebSockets.
2. **Streaming AI Gateway:** Update `AIGateway` to yield tokens progressively (`async for chunk in response`) rather than waiting for full JSON generation.
3. **Interrupt Handling:** Add VAD (Voice Activity Detection) on the frontend to detect when the user speaks, sending a "cancel" interrupt to the WSS to abruptly stop the TTS generation.
