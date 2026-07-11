import base64
import json
import logging
from typing import Any, Dict

from anthropic import Anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


VISION_SYSTEM_PROMPT = (
    "You are a dermatological assistant helping a skincare app analyze a "
    "user-submitted selfie for general skin characteristics. You are not a "
    "medical device and must not diagnose conditions. Respond ONLY with a "
    "single minified JSON object (no markdown, no preamble) matching this "
    'shape: {"skin_type": "oily|dry|combination|normal|unknown", '
    '"concerns": ["acne", "hyperpigmentation", "fine_lines", "redness", '
    '"large_pores", "dullness"], "hydration_level": "low|medium|high|unknown", '
    '"texture_notes": "short free-text note", "confidence": "low|medium|high"}'
)


def analyze_skin_image(image_bytes: bytes, media_type: str = "image/jpeg") -> Dict[str, Any]:
    """Send an uploaded photo to the vision-capable LLM and return a
    structured, best-effort skin analysis. Falls back to a safe default
    payload if the API call or parsing fails.
    """
    fallback: Dict[str, Any] = {
        "skin_type": "unknown",
        "concerns": [],
        "hydration_level": "unknown",
        "texture_notes": "Automated analysis unavailable.",
        "confidence": "low",
    }

    if not settings.ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set; skipping vision analysis")
        return fallback

    try:
        client = _get_client()
        encoded_image = base64.standard_b64encode(image_bytes).decode("utf-8")

        response = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=500,
            system=VISION_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": encoded_image,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this skin photo and return the JSON object only.",
                        },
                    ],
                }
            ],
        )

        text_blocks = [block.text for block in response.content if block.type == "text"]
        raw_text = "".join(text_blocks).strip()
        raw_text = raw_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        parsed = json.loads(raw_text)
        return parsed
    except Exception:
        logger.exception("Vision analysis failed; returning fallback result")
        return fallback
