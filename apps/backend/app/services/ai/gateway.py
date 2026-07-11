import os
import logging
from typing import Type, TypeVar
from pydantic import BaseModel

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
            
    def generate_structured_output(self, prompt: str, schema: Type[T], system_prompt: str = None) -> T:
        return self.provider.generate_structured_output(prompt, schema, system_prompt)
        
    def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        return self.provider.generate_text(prompt, system_prompt)
