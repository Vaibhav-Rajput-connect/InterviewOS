from abc import ABC, abstractmethod

class BaseSpeechToTextProvider(ABC):
    """
    Abstract Base Class for Speech-To-Text (STT) providers.
    Any future voice provider (e.g., Google Cloud, Whisper) must implement this interface.
    """
    
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Transcribes audio bytes into text.
        
        Args:
            audio_bytes: The raw or encoded audio bytes from the user's microphone.
            
        Returns:
            The transcribed text string.
        """
        pass
