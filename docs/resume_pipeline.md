# Resume Pipeline Architecture

The Resume Pipeline is responsible for processing uploaded PDF/DOCX files, extracting raw text, converting that text into structured data using AI models, mapping technologies, generating embeddings, and saving everything to the PostgreSQL database.

## Architecture & Flow

1. **Upload & Storage**
   - The user uploads a PDF or DOCX file via `POST /api/v1/resume/upload`.
   - The file is securely saved to local storage with a UUID-prefixed filename.
   - The database creates a new `Resume` record with `parsing_status = "pending"`.
   - A background task (`process_resume_background`) is spawned to handle the heavy lifting asynchronously, ensuring the API responds immediately.

2. **Text Extraction**
   - The background worker uses `pdfplumber` or `docx2txt` (wrapped in `ResumeParser`) to extract raw text from the document.
   - The raw text is saved to the `content` field of the `Resume` record.

3. **AI Metadata Extraction (First Pass)**
   - The raw text is sent to the `AIGateway`, which wraps Google's Gemini models using the Provider Strategy pattern.
   - Using structured output generation (`generate_structured_output`), the text is converted into a Pydantic schema: `ExtractedResumeMetadata`.
   - This extracts basic structures: Education, Experience (with specific technologies), Projects, and Skills.

4. **Deep AI Analysis (Second Pass)**
   - A second call to the `AIGateway` analyzes the text and produces `DeepResumeAnalysis`.
   - This pass evaluates the resume, providing an overall score, ATS score, technical score, strengths, weaknesses, learning roadmaps, and career suggestions.

5. **Data Normalization & Mapping**
   - Extracted technologies (from skills, experiences, and projects) are normalized (lowercased/stripped) and upserted into the `technologies` table.
   - Relational records are created (`ResumeSkill`, `ResumeExperience`, `ResumeProject`, `ResumeEducation`, etc.).

6. **Semantic Embeddings**
   - The extracted components (skills, experiences, projects) are chunked into text blocks and sent to the `EmbeddingService`.
   - Vectors are generated using Google's GenAI embedding models (`text-embedding-004`).
   - The vectors are saved to the `embeddings` table via `pgvector` for future Retrieval-Augmented Generation (RAG).

7. **Cleanup & Completion**
   - The resume status is updated to `completed`.
   - The original PDF/DOCX file is securely deleted from the local disk to save space and ensure privacy compliance.

## Resiliency
The AI Gateway is wrapped with exponential backoff retry logic (using `tenacity`) to gracefully handle rate-limits or temporary API failures from the provider.
