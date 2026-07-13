from app.services.voice.stt import BaseSpeechToTextProvider
from app.services.voice.tts import BaseTextToSpeechProvider

class DummySTTProvider(BaseSpeechToTextProvider):
    async def transcribe(self, audio_bytes: bytes) -> str:
        return "This is a dummy transcription. Voice features are currently disabled."

class DummyTTSProvider(BaseTextToSpeechProvider):
    async def synthesize(self, text: str, voice_id: str | None = None) -> bytes:
        # Return an empty byte string to satisfy the interface
        return b""
