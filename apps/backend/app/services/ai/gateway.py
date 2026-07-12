import os
import logging
from typing import Type, TypeVar
from pydantic import BaseModel

from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.services.ai.providers.base import BaseAIProvider
from app.services.ai.providers.factory import ProviderFactory

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class AIGateway:
    """
    Centralized Gateway for AI services.
    Uses the Provider Strategy Pattern to abstract the underlying AI model.
    """
    
    def __init__(self):
        self.provider: BaseAIProvider = ProviderFactory.get_provider()
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def generate_structured_output(self, prompt: str, schema: Type[T], system_prompt: str | None = None) -> T:
        return self.provider.generate_structured_output(prompt, schema, system_prompt)
        
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        return self.provider.generate_text(prompt, system_prompt)
