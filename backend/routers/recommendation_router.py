"""
routers/recommendation_router.py — Skincare Recommendation API
================================================================
Phase 12: Product Recommendations + Daily Routine

Endpoint defined here:
  POST /api/recommend  — Given the predicted class and risk level,
                         return relevant product recommendations,
                         a personalised daily skin-care routine, and
                         dermatologist consultation guidance.

Design:
  - Delegates ALL recommendation logic to services/recommendation_service.py.
  - The ML model is NOT involved here; recommendations are rule-based.
  - Authentication required — only logged-in users can fetch recommendations.
  - Products are for GENERAL SKIN-CARE information ONLY, never treatments.
  - Supports multi-language output via the `language` field in the request body.
    Translations are applied using services/translation_service.py (Google Translate).

Medical safety:
  HIGH-risk conditions (mel, bcc, akiec) return FEWER products and much
  stronger disclaimers. The response always prioritises "see a dermatologist"
  over product browsing for serious findings.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_user
from models import User
from schemas import (
    RecommendationRequest,
    RecommendationResponse,
    ProductItem,
    RoutineStep,
    DaytimeSection,
    DailyRoutineData,
    DermatologistGuidanceData,
)
from services.recommendation_service import (
    get_products_for_condition,
    get_routine_for_condition,
    get_dermatologist_guidance,
    SAFETY_DISCLAIMER,
    HIGH_RISK_SAFETY_NOTE,
    HIGH_RISK_CLASSES,
)
from services.translation_service import translate_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/recommend",
    tags=["Recommendations"],
)

VALID_CLASSES = {"akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"}
VALID_RISKS   = {"Low", "Medium", "High"}


@router.post(
    "",
    response_model=RecommendationResponse,
    summary="Get skincare product recommendations and daily routine for an assessment",
    description=(
        "Accepts the predicted HAM10000 class and risk level and returns:\n\n"
        "- Curated skincare product suggestions (general skin care, NOT treatments)\n"
        "- A personalised daily routine (Morning / Daytime / Night / Daily Habits)\n"
        "- Dermatologist consultation guidance appropriate to the risk level\n\n"
        "**Requires** `Authorization: Bearer <token>` header.\n\n"
        "Pass `language` (ISO 639-1 code, e.g. `\"hi\"`, `\"te\"`) to receive the response "
        "in that language. Defaults to `\"en\"` (English).\n\n"
        "⚠️ **Medical disclaimer**: All recommendations are for educational and general "
        "skin-care purposes only. They are NOT medical treatments."
    ),
)
def get_recommendations(
    payload: RecommendationRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate product recommendations and daily routine for the given prediction.

    Validates the predicted_class and risk_level.
    Delegates computation to recommendation_service.py.
    Translates the response to the requested language via translation_service.py.
    Returns a fully structured RecommendationResponse.
    """
    # ── Validate predicted_class ──────────────────────────────────────────────
    if payload.predicted_class not in VALID_CLASSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid predicted_class '{payload.predicted_class}'. "
                   f"Must be one of: {', '.join(sorted(VALID_CLASSES))}.",
        )

    # ── Validate risk_level ───────────────────────────────────────────────────
    if payload.risk_level not in VALID_RISKS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid risk_level '{payload.risk_level}'. "
                   f"Must be one of: {', '.join(sorted(VALID_RISKS))}.",
        )

    language = payload.language or "en"

    logger.info(
        "[recommendation_router] Recommendations requested by %s for class=%s risk=%s lang=%s",
        current_user.email,
        payload.predicted_class,
        payload.risk_level,
        language,
    )

    # ── Get products ──────────────────────────────────────────────────────────
    raw_products = get_products_for_condition(payload.predicted_class, payload.risk_level)

    # ── Get routine ───────────────────────────────────────────────────────────
    raw_routine = get_routine_for_condition(
        payload.predicted_class,
        payload.risk_level,
        payload.skin_type,
    )

    # ── Get dermatologist guidance ─────────────────────────────────────────────
    raw_guidance = get_dermatologist_guidance(payload.predicted_class, payload.risk_level)

    # ── Safety note for high-risk conditions ──────────────────────────────────
    safety_note = (
        HIGH_RISK_SAFETY_NOTE if payload.predicted_class in HIGH_RISK_CLASSES else None
    )

    # ── Build response dict for translation ───────────────────────────────────
    response_dict = {
        "predicted_class":         payload.predicted_class,
        "risk_level":              payload.risk_level,
        "products":                raw_products,
        "routine":                 raw_routine,
        "dermatologist_guidance":  raw_guidance,
        "disclaimer":              SAFETY_DISCLAIMER,
        "safety_note":             safety_note,
    }

    # ── Translate all text fields if a non-English language was requested ──────
    if language != "en":
        logger.info("[recommendation_router] Translating response to '%s'", language)
        response_dict = translate_recommendations(response_dict, language)

    # ── Build Pydantic response ────────────────────────────────────────────────
    products = [ProductItem(**p) for p in response_dict["products"]]

    routine_data = response_dict["routine"]
    routine = DailyRoutineData(
        morning=[RoutineStep(**s) for s in routine_data["morning"]],
        daytime=DaytimeSection(**routine_data["daytime"]),
        night=[RoutineStep(**s) for s in routine_data["night"]],
        daily_habits=routine_data["daily_habits"],
    )

    dermatologist_guidance = DermatologistGuidanceData(**response_dict["dermatologist_guidance"])

    return RecommendationResponse(
        predicted_class=response_dict["predicted_class"],
        risk_level=response_dict["risk_level"],
        products=products,
        routine=routine,
        dermatologist_guidance=dermatologist_guidance,
        disclaimer=response_dict["disclaimer"],
        safety_note=response_dict["safety_note"],
    )
