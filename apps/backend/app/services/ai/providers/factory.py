import os
import logging
from typing import Dict, Type, Optional

from app.services.ai.providers.base import BaseAIProvider
from app.services.ai.providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)

class ProviderFactory:
    """
    Factory for instantiating AI Providers based on configuration.
    Adding a new provider (e.g., OpenAI, Claude) only requires adding it to _providers.
    """
    _providers: Dict[str, Type[BaseAIProvider]] = {
        "gemini": GeminiProvider,
        # "openai": OpenAIProvider, # Future extension
        # "claude": ClaudeProvider, # Future extension
    }

    @classmethod
    def get_provider(cls, provider_name: Optional[str] = None) -> BaseAIProvider:
        if not provider_name:
            provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
            
        provider_class = cls._providers.get(provider_name)
        
        if not provider_class:
            logger.warning(f"Unknown AI provider '{provider_name}'. Falling back to 'gemini'.")
            provider_class = cls._providers["gemini"]
            
        logger.info(f"Instantiating AI Provider: {provider_class.__name__}")
        return provider_class()
