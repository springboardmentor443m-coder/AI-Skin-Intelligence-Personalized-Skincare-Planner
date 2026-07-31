import json
from functools import lru_cache
from pathlib import Path
from typing import Any


RECOMMENDATIONS_PATH = Path(__file__).resolve().parent / "recommendations.json"


class RecommendationError(Exception):
    """Base exception for recommendation data errors."""


class RecommendationFileMissingError(RecommendationError):
    """Raised when the recommendation data file is not available."""


class RecommendationFileInvalidError(RecommendationError):
    """Raised when the recommendation data is not valid JSON."""


class RecommendationNotFoundError(RecommendationError):
    """Raised when a prediction has no matching recommendation."""


class RecommendationUnexpectedError(RecommendationError):
    """Raised when recommendation data cannot be loaded unexpectedly."""


@lru_cache(maxsize=1)
def _load_recommendations() -> dict[str, dict[str, Any]]:
    """Load recommendation data once and cache it for the process lifetime."""
    if not RECOMMENDATIONS_PATH.is_file():
        raise RecommendationFileMissingError(
            f"Recommendation file not found: {RECOMMENDATIONS_PATH}"
        )

    try:
        with RECOMMENDATIONS_PATH.open("r", encoding="utf-8") as file:
            recommendations = json.load(file)
    except json.JSONDecodeError as exc:
        raise RecommendationFileInvalidError(
            f"Recommendation file contains invalid JSON: {exc.msg}"
        ) from exc
    except OSError as exc:
        raise RecommendationFileMissingError(
            f"Unable to read recommendation file: {exc}"
        ) from exc

    if not isinstance(recommendations, dict):
        raise RecommendationFileInvalidError(
            "Recommendation file must contain a JSON object."
        )

    if not all(isinstance(value, dict) for value in recommendations.values()):
        raise RecommendationFileInvalidError(
            "Each recommendation must be represented by a JSON object."
        )

    return recommendations


def get_recommendation(condition_name: str) -> dict[str, Any]:
    """Return the cached recommendation for a predicted skin condition."""
    if not isinstance(condition_name, str) or not condition_name.strip():
        raise RecommendationNotFoundError(
            "The predicted skin condition is missing or invalid."
        )

    try:
        recommendations = _load_recommendations()
        recommendation = recommendations.get(condition_name)
    except RecommendationError:
        raise
    except Exception as exc:
        raise RecommendationUnexpectedError(
            "Unexpected error while loading recommendation data."
        ) from exc

    if not isinstance(recommendation, dict):
        raise RecommendationNotFoundError(
            f"No recommendation found for prediction class: {condition_name}"
        )

    return recommendation
