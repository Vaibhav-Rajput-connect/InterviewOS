import os
import logging
from app.services.voice.stt import BaseSpeechToTextProvider
from app.services.voice.tts import BaseTextToSpeechProvider

logger = logging.getLogger(__name__)

class VoiceProviderFactory:
    """
    Factory for instantiating Voice (STT and TTS) providers.
    Currently returns dummy providers to satisfy the interface until 
    actual third-party integrations (e.g. Whisper, ElevenLabs) are built.
    """
    
    @staticmethod
    def get_stt_provider() -> BaseSpeechToTextProvider:
        provider = os.getenv("STT_PROVIDER", "dummy").lower()
        
        if provider == "dummy":
            from app.services.voice.dummy import DummySTTProvider
            return DummySTTProvider()
            
        logger.error(f"Unsupported STT provider: {provider}")
        raise ValueError(f"Unsupported STT provider: {provider}")
        
    @staticmethod
    def get_tts_provider() -> BaseTextToSpeechProvider:
        provider = os.getenv("TTS_PROVIDER", "dummy").lower()
        
        if provider == "dummy":
            from app.services.voice.dummy import DummyTTSProvider
            return DummyTTSProvider()
            
        logger.error(f"Unsupported TTS provider: {provider}")
        raise ValueError(f"Unsupported TTS provider: {provider}")
