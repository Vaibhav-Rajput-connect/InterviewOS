from google import genai
from google.genai import types
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
try:
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents="Hello",
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
