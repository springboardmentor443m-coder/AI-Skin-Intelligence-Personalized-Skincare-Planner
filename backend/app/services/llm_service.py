import json
import logging
from typing import Any, Dict, List

from anthropic import Anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


ROUTINE_SYSTEM_PROMPT = (
    "You are a skincare routine planner. Given a user's skin type, concerns, "
    "questionnaire answers, and optional vision analysis, produce a safe, "
    "general-audience AM/PM skincare routine. Do not recommend prescription "
    "ingredients or make medical claims; favor widely-available, gentle "
    "products and always include sunscreen in the AM routine. Respond ONLY "
    "with a single minified JSON object (no markdown, no preamble) matching "
    'this shape: {"summary": "one paragraph overview", "steps": '
    '[{"time_of_day": "AM|PM", "order": 1, "product_type": "Cleanser", '
    '"instruction": "short instruction"}]}'
)

FALLBACK_ROUTINE: Dict[str, Any] = {
    "summary": (
        "A gentle general-purpose routine while personalized recommendations "
        "are unavailable. Focus on cleansing, moisturizing, and daily SPF."
    ),
    "steps": [
        {"time_of_day": "AM", "order": 1, "product_type": "Cleanser", "instruction": "Wash with a gentle, fragrance-free cleanser."},
        {"time_of_day": "AM", "order": 2, "product_type": "Moisturizer", "instruction": "Apply a lightweight moisturizer."},
        {"time_of_day": "AM", "order": 3, "product_type": "Sunscreen", "instruction": "Apply broad-spectrum SPF 30+."},
        {"time_of_day": "PM", "order": 1, "product_type": "Cleanser", "instruction": "Wash with a gentle, fragrance-free cleanser."},
        {"time_of_day": "PM", "order": 2, "product_type": "Moisturizer", "instruction": "Apply a nourishing night moisturizer."},
    ],
}


def generate_routine(
    skin_type: str | None,
    concerns: List[str],
    questionnaire_answers: Dict[str, Any],
    vision_analysis: Dict[str, Any] | None,
) -> Dict[str, Any]:
    """Ask the LLM to produce a structured AM/PM routine. Falls back to a
    safe generic routine if the API call or JSON parsing fails.
    """
    if not settings.ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set; returning fallback routine")
        return FALLBACK_ROUTINE

    user_context = {
        "skin_type": skin_type,
        "concerns": concerns,
        "questionnaire_answers": questionnaire_answers,
        "vision_analysis": vision_analysis or {},
    }

    try:
        client = _get_client()
        response = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=1000,
            system=ROUTINE_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Generate a routine for this profile (JSON):\n"
                        + json.dumps(user_context)
                    ),
                }
            ],
        )

        text_blocks = [block.text for block in response.content if block.type == "text"]
        raw_text = "".join(text_blocks).strip()
        raw_text = raw_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        parsed = json.loads(raw_text)
        if "steps" not in parsed or not parsed["steps"]:
            raise ValueError("LLM response missing steps")
        return parsed
    except Exception:
        logger.exception("Routine generation failed; returning fallback routine")
        return FALLBACK_ROUTINE
