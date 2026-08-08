# ==============================================================================
# backend/llm/gemini_client.py
# ==============================================================================

from pathlib import Path

from google import genai
from google.genai import types

from backend.config import GEMINI_API_KEY, GEMINI_MODEL


class GeminiClient:

    def __init__(self):

        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not configured."
            )

        self.client = genai.Client(
            api_key=GEMINI_API_KEY
        )

    def generate_recommendation(
        self,
        prompt: str,
        image_path: Path
    ):

        image_bytes = image_path.read_bytes()

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=self._get_mime_type(image_path)
        )

        response = self.client.models.generate_content(
            model=GEMINI_MODEL,

            contents=[
                image_part,
                prompt
            ],

            config=types.GenerateContentConfig(
                temperature=0.3,
                response_mime_type="application/json"
            )
        )

        return response.text

    @staticmethod
    def _get_mime_type(image_path: Path) -> str:

        suffix = image_path.suffix.lower()

        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp"
        }

        if suffix not in mime_types:
            raise ValueError(
                f"Unsupported image format: {suffix}"
            )

        return mime_types[suffix]