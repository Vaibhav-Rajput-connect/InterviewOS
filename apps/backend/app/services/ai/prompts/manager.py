import os
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

class PromptManager:
    """
    Centralized Prompt Manager for InterviewOS.
    Loads and formats prompts from the file system.
    """
    
    BASE_DIR = Path(__file__).resolve().parent
    
    @classmethod
    def get_prompt(cls, category: str, prompt_name: str, version: str = "v1", **kwargs: Any) -> str:
        """
        Loads a prompt template and injects variables.
        
        :param category: e.g. 'resume', 'coach', 'interview'
        :param prompt_name: e.g. 'extraction', 'analysis'
        :param version: e.g. 'v1'
        :param kwargs: variables to format into the prompt
        """
        prompt_path = cls.BASE_DIR / category / f"{prompt_name}_{version}.txt"
        
        if not prompt_path.exists():
            logger.error(f"Prompt template not found: {prompt_path}")
            raise FileNotFoundError(f"Prompt template '{prompt_name}_{version}' not found in category '{category}'")
            
        with open(prompt_path, 'r', encoding='utf-8') as f:
            template = f.read()
            
        try:
            return template.format(**kwargs)
        except KeyError as e:
            logger.error(f"Missing required variable for prompt '{prompt_name}': {e}")
            raise ValueError(f"Missing required variable {e} for prompt {prompt_name}")
