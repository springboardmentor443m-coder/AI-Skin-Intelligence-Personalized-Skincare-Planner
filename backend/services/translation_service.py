"""
services/translation_service.py — Text Translation Utility
===========================================================
Provides a helper to translate text strings using Google Translate
via the deep-translator library (no API key required).

Supported languages (ISO 639-1 codes):
  en - English (no translation applied)
  hi - Hindi
  te - Telugu
  ta - Tamil
  kn - Kannada
  ml - Malayalam
  mr - Marathi
  bn - Bengali

Design:
  - Translation is attempted silently; if it fails the original English
    text is returned so the app never breaks due to a translation error.
  - Lists of strings are translated item-by-item.
  - English (\"en\") input is returned immediately without an API call.
"""

import logging
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)

# Languages supported by the recommendation system.
# Values are Google Translate language codes (same as ISO 639-1 here).
SUPPORTED_LANGUAGES = {"en", "hi", "te", "ta", "kn", "ml", "mr", "bn"}


def translate_text(text: str, target_language: str) -> str:
    """
    Translate a single string to the target language.

    Returns the original text unchanged if:
      - target_language is "en" (no translation needed)
      - target_language is not in SUPPORTED_LANGUAGES
      - translation fails for any reason (network, quota, etc.)
    """
    if not text or not text.strip():
        return text

    if target_language == "en" or target_language not in SUPPORTED_LANGUAGES:
        return text

    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source="en", target=target_language).translate(text)
        return translated if translated else text
    except Exception as exc:
        logger.warning(
            "[translation_service] Translation to '%s' failed: %s — returning original text.",
            target_language,
            exc,
        )
        return text


def translate_list(items: List[str], target_language: str) -> List[str]:
    """Translate each string in a list."""
    return [translate_text(item, target_language) for item in items]


def translate_routine_steps(steps: List[Dict], target_language: str) -> List[Dict]:
    """
    Translate the 'title' and 'description' fields of each routine step dict.
    All other fields are preserved unchanged.
    """
    if target_language == "en":
        return steps
    return [
        {
            **step,
            "title":       translate_text(step.get("title", ""), target_language),
            "description": translate_text(step.get("description", ""), target_language),
        }
        for step in steps
    ]


def translate_recommendations(data: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Translate all user-visible text fields within a RecommendationResponse dict.

    Translates:
      - disclaimer, safety_note
      - products: description, why_useful, how_to_use, precautions, key_features
      - routine: morning/night step titles + descriptions, daytime dos/avoids, daily_habits
      - dermatologist_guidance: urgency_message, general_advice, warning_signs

    Returns the original dict unchanged if target_language is \"en\".
    """
    if target_language == "en" or target_language not in SUPPORTED_LANGUAGES:
        return data

    translated = dict(data)

    # ── Top-level text fields ──────────────────────────────────────────────────
    if translated.get("disclaimer"):
        translated["disclaimer"] = translate_text(translated["disclaimer"], target_language)
    if translated.get("safety_note"):
        translated["safety_note"] = translate_text(translated["safety_note"], target_language)

    # ── Products ───────────────────────────────────────────────────────────────
    if translated.get("products"):
        new_products = []
        for product in translated["products"]:
            p = dict(product)
            p["description"]  = translate_text(p.get("description", ""),  target_language)
            p["why_useful"]   = translate_text(p.get("why_useful", ""),   target_language)
            p["how_to_use"]   = translate_text(p.get("how_to_use", ""),   target_language)
            p["precautions"]  = translate_text(p.get("precautions", ""),  target_language)
            p["key_features"] = translate_list(p.get("key_features", []), target_language)
            new_products.append(p)
        translated["products"] = new_products

    # ── Routine ────────────────────────────────────────────────────────────────
    if translated.get("routine"):
        routine = dict(translated["routine"])

        if routine.get("morning"):
            routine["morning"] = translate_routine_steps(routine["morning"], target_language)

        if routine.get("night"):
            routine["night"] = translate_routine_steps(routine["night"], target_language)

        if routine.get("daytime"):
            daytime = dict(routine["daytime"])
            if daytime.get("do"):
                daytime["do"] = translate_list(daytime["do"], target_language)
            if daytime.get("avoid"):
                daytime["avoid"] = translate_list(daytime["avoid"], target_language)
            routine["daytime"] = daytime

        if routine.get("daily_habits"):
            routine["daily_habits"] = translate_list(routine["daily_habits"], target_language)

        translated["routine"] = routine

    # ── Dermatologist guidance ─────────────────────────────────────────────────
    if translated.get("dermatologist_guidance"):
        guidance = dict(translated["dermatologist_guidance"])
        guidance["urgency_message"] = translate_text(
            guidance.get("urgency_message", ""), target_language
        )
        guidance["general_advice"] = translate_text(
            guidance.get("general_advice", ""), target_language
        )
        if guidance.get("warning_signs"):
            guidance["warning_signs"] = translate_list(
                guidance["warning_signs"], target_language
            )
        translated["dermatologist_guidance"] = guidance

    return translated
