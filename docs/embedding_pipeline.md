# Embedding Pipeline Architecture

The Embedding Pipeline is responsible for creating vector representations of resume components (skills, experiences, projects) to enable semantic search and Retrieval-Augmented Generation (RAG) during the Interview Chamber phase.

## Architecture

1. **Text Chunking**
   - The AI analysis generates structured components (Skills, Experience, Projects).
   - During the database population phase of `process_resume_background`, these components are formatted into raw text chunks.
   - Example chunk: `"Experience: Senior Software Engineer at Tech Corp. Developed a highly scalable API..."`

2. **Embedding Generation**
   - The formatted text chunks are aggregated into a batch list.
   - The batch is sent to the `EmbeddingService` (`app/services/embedding.py`).
   - The `EmbeddingService` interfaces with the Google GenAI `text-embedding-004` model.
   - Output dimensionality: 768 dimensions.

3. **Vector Storage (pgvector)**
   - The resulting 768-dimensional float vectors are saved directly to PostgreSQL.
   - The `embeddings` table contains a `VECTOR(768)` column provided by the `pgvector` extension.
   - A foreign key links each embedding block back to the original `Resume`.

## Usage in Interview Chamber
When the AI Coach starts a technical interview, it can perform semantic similarity search against the user's `embeddings` table using cosine distance (`<=>` operator in pgvector) to retrieve highly relevant context (e.g., retrieving specific project details when asking questions about a specific technology).
