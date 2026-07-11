import logging
from typing import Type, TypeVar
from pydantic import BaseModel
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.services.ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class AIProviderError(Exception):
    pass

class GeminiProvider(BaseAIProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set.")
            raise ValueError("GEMINI_API_KEY is not set.")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash"
        
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def generate_structured_output(self, prompt: str, schema: Type[T], system_prompt: str = None) -> T:
        logger.info(f"Generating structured output with Gemini using schema {schema.__name__}")
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        
        config_kwargs = {
            "response_mime_type": "application/json",
            "response_schema": schema,
            "temperature": 0.1,
        }
        if system_prompt:
            config_kwargs["system_instruction"] = system_prompt
            
        config = types.GenerateContentConfig(**config_kwargs)
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config,
            )
            return schema.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Gemini generation error: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate structured output: {str(e)}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        logger.info("Generating text with Gemini")
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        
        config_kwargs = {"temperature": 0.7}
        if system_prompt:
            config_kwargs["system_instruction"] = system_prompt
            
        config = types.GenerateContentConfig(**config_kwargs)
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini text generation error: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate text: {str(e)}")
