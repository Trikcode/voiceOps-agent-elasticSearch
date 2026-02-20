"""
Cross-browser speech-to-text using Groq's Whisper API.
Records audio in the browser (MediaRecorder API), sends to backend,
backend forwards to Groq Whisper for transcription.
Works on Chrome, Firefox, Safari, and Edge.
"""

import httpx
from app.config import LLM_API_KEY


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    mime_types = {
        ".webm": "audio/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/m4a",
        ".ogg": "audio/ogg",
    }

    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ".webm"
    content_type = mime_types.get(ext, "audio/webm")

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {LLM_API_KEY}"},
            files={"file": (filename, audio_bytes, content_type)},
            data={"model": "whisper-large-v3", "language": "en"},
        )
        response.raise_for_status()
        return response.json()["text"]