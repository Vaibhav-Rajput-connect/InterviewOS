from typing import List, Union
from google import genai
from google.genai import types
from app.core.config import settings

class EmbeddingService:
    """
    Handles generation of Vector Embeddings using Google Gemini.
    """
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-embedding-2"

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a 768-dimensional vector embedding for a single text string.
        """
        config = types.EmbedContentConfig(output_dimensionality=768)
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=text,
            config=config,
        )
        if not response.embeddings or not response.embeddings[0].values:
            return []
        return response.embeddings[0].values[:768]

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of text strings in a batch.
        """
        config = types.EmbedContentConfig(output_dimensionality=768)
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=texts,
            config=config,
        )
        if not response.embeddings:
            return []
        
        results = []
        for embed in response.embeddings:
            if embed.values:
                results.append(embed.values[:768])
            else:
                results.append([])
        return results
