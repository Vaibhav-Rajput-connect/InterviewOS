from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class BaseAIProvider(ABC):
    @abstractmethod
    def generate_structured_output(self, prompt: str, schema: Type[T], system_prompt: str = None) -> T:
        """Generate structured output matching the provided Pydantic schema."""
        pass
        
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        """Generate raw text output."""
        pass
