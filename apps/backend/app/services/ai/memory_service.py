import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.ai_memory import AIMemory
from app.services.embedding import EmbeddingService
from app.core.cache import rag_cache

logger = logging.getLogger(__name__)

class AIMemoryService:
    """
    Handles storage and semantic retrieval of persistent AI Context.
    """
    def __init__(self):
        self.embedding_service = EmbeddingService()

    async def add_memory(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        memory_type: str, 
        content: str, 
        meta_data: Optional[Dict[str, Any]] = None
    ) -> AIMemory:
        """
        Generates an embedding for the content and stores it as a memory.
        """
        logger.info(f"Adding memory for user {user_id} of type {memory_type}")
        
        # Generate 768-dim vector embedding
        embedding_vector = self.embedding_service.generate_embedding(content)
        
        memory = AIMemory(
            user_id=user_id,
            memory_type=memory_type,
            content=content,
            meta_data=meta_data,
            embedding=embedding_vector
        )
        
        db.add(memory)
        await db.commit()
        await db.refresh(memory)
        return memory

    async def retrieve_relevant_context(
        self, 
        db: AsyncSession, 
        user_id: uuid.UUID, 
        query_text: str, 
        limit: int = 5,
        memory_types: Optional[List[str]] = None
    ) -> str:
        """
        Retrieves the most semantically relevant memories for a given query text.
        Caches identical RAG vector lookups ephemerally to bypass PostgreSQL execution.
        """
        # Create a simple cache key ignoring the `db` session
        cache_key = f"{user_id}:{query_text}:{limit}:{str(memory_types)}"
        
        # Check cache
        import time
        now = time.time()
        if cache_key in rag_cache.cache:
            result, timestamp = rag_cache.cache[cache_key]
            if now - timestamp < rag_cache.ttl:
                logger.debug("RAG Cache HIT: Bypassing pgvector lookup.")
                return result

        query_embedding = self.embedding_service.generate_embedding(query_text)
        
        # pgvector L2 distance operator `<->`
        stmt = select(AIMemory).filter(AIMemory.user_id == user_id)
        
        if memory_types:
            stmt = stmt.filter(AIMemory.memory_type.in_(memory_types))
            
        stmt = stmt.order_by(AIMemory.embedding.l2_distance(query_embedding)).limit(limit)
        
        result = await db.execute(stmt)
        memories = result.scalars().all()
        
        if not memories:
            context = "No highly relevant past context found."
        else:
            context_pieces = []
            for mem in memories:
                context_pieces.append(f"[{mem.memory_type}]: {mem.content}")
            context = "\n---\n".join(context_pieces)
            
        # Store in cache
        rag_cache.cache[cache_key] = (context, now)
        return context

    async def ingest_interview_session(self, db: AsyncSession, user_id: uuid.UUID, session_summary: str, weak_points: List[str]):
        """
        Ingests interview data into memory.
        """
        if session_summary:
            await self.add_memory(db, user_id, "interview", session_summary)
            
        for wp in weak_points:
            await self.add_memory(db, user_id, "weak_topic", f"Struggled with: {wp}")

    async def ingest_coding_session(self, db: AsyncSession, user_id: uuid.UUID, problem_title: str, is_success: bool, time_complexity: str = "", space_complexity: str = ""):
        """
        Ingests a coding session outcome into memory.
        """
        status = "successfully solved" if is_success else "failed to solve"
        content = f"User {status} coding problem '{problem_title}'."
        if time_complexity and space_complexity:
             content += f" Time complexity: {time_complexity}. Space complexity: {space_complexity}."
             
        await self.add_memory(db, user_id, "coding", content, meta_data={"is_success": is_success, "problem_title": problem_title})

    async def retrieve_comprehensive_context(self, db: AsyncSession, user_id: uuid.UUID) -> str:
        """
        Retrieves a compressed, comprehensive context snapshot for the user,
        including recent learning plans, weak topics, and interview feedback.
        Useful for injecting into RAG prompts for AI Coach and Interview Engine.
        """
        stmt = (
            select(AIMemory)
            .where(AIMemory.user_id == user_id)
            .where(AIMemory.memory_type.in_(["weak_topic", "interview", "coding", "evaluation", "learning_plan"]))
            .order_by(AIMemory.created_at.desc())
            .limit(10)
        )
        
        result = await db.execute(stmt)
        memories = result.scalars().all()
        
        if not memories:
            return "No previous context available."
            
        context_parts = []
        for mem in memories:
            if mem.memory_type == "learning_plan":
                context_parts.append(f"[CURRENT FOCUS]: {mem.content}")
            else:
                context_parts.append(f"[{mem.memory_type.upper()}]: {mem.content}")
                
        # Compress by truncating the total length if it gets too huge
        full_context = "\n".join(context_parts)
        if len(full_context) > 4000:
            full_context = full_context[:4000] + "...(truncated)"
            
        return full_context
