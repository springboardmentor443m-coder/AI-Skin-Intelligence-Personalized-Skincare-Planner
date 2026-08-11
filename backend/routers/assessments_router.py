"""
routers/assessments_router.py — Assessment History & Recommendations API
=========================================================================
Phase 10: History + Recommendations

Endpoints:
  GET /api/assessments                         — List authenticated user's assessments
  GET /api/assessments/{assessment_id}         — Get a single assessment detail
  GET /api/assessments/{assessment_id}/recommendations — Educational recommendations

Security:
  - All endpoints require a valid JWT (Authorization: Bearer <token>)
  - Users can ONLY access their own assessments
  - user_id filter is enforced on every query

Educational disclaimer:
  Recommendations are general EDUCATIONAL guidance only.
  They are NOT medical advice and must NOT be used for clinical decisions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Assessment, User
from schemas import (
    AssessmentListResponse,
    AssessmentResponse,
    RecommendationItem,
    RecommendationsResponse,
)

router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"],
)

# ── Educational recommendations data ─────────────────────────────────────────
#
# These are EDUCATIONAL guidance messages keyed by risk level.
# They are NOT medical advice and must NEVER be presented as diagnosis.

EDUCATIONAL_GUIDANCE = {
    "Low": [
        RecommendationItem(
            title="Continue General Skin Care",
            description=(
                "Maintain a regular skincare routine including gentle cleansing "
                "and moisturising appropriate for your skin type."
            ),
        ),
        RecommendationItem(
            title="Sun Protection",
            description=(
                "Apply a broad-spectrum SPF 30+ sunscreen daily, even on cloudy "
                "days, and reapply after swimming or sweating."
            ),
        ),
        RecommendationItem(
            title="Monitor the Area",
            description=(
                "Keep track of any changes in the lesion's size, shape, colour, "
                "or texture. Use the ABCDE rule: Asymmetry, Border, Colour, "
                "Diameter, Evolution."
            ),
        ),
        RecommendationItem(
            title="Professional Check-up",
            description=(
                "Consider a routine dermatological check-up, especially if the "
                "lesion changes or if you have a family history of skin cancer."
            ),
        ),
    ],
    "Medium": [
        RecommendationItem(
            title="Seek a Professional Evaluation",
            description=(
                "Consider consulting a qualified dermatologist for an in-person "
                "evaluation of this lesion. A physical examination provides "
                "information an AI cannot."
            ),
        ),
        RecommendationItem(
            title="Do Not Self-Diagnose",
            description=(
                "AI predictions are educational tools and are NOT substitutes "
                "for a clinical diagnosis. Do not rely on this result alone."
            ),
        ),
        RecommendationItem(
            title="Monitor for Changes",
            description=(
                "Photograph the area regularly and note any changes. Seek "
                "medical attention promptly if the lesion grows, bleeds, "
                "itches, or changes colour."
            ),
        ),
        RecommendationItem(
            title="Avoid Irritation",
            description=(
                "Avoid scratching, picking, or applying harsh products to the "
                "area until it has been evaluated by a healthcare professional."
            ),
        ),
    ],
    "High": [
        RecommendationItem(
            title="Seek Professional Dermatological Evaluation",
            description=(
                "We strongly encourage you to consult a qualified dermatologist "
                "or healthcare professional as soon as reasonably possible. "
                "This AI result is NOT a diagnosis — only a clinical examination "
                "can determine the nature of a skin lesion."
            ),
        ),
        RecommendationItem(
            title="Do Not Rely on AI Prediction Alone",
            description=(
                "High-risk predictions indicate classes that may require "
                "professional attention, but the AI model can make errors. "
                "A dermatologist using dermoscopy or biopsy provides a definitive answer."
            ),
        ),
        RecommendationItem(
            title="Act Promptly if Concerned",
            description=(
                "If the lesion is growing rapidly, bleeding, or causing symptoms, "
                "seek medical attention without delay."
            ),
        ),
        RecommendationItem(
            title="Bring This Report to Your Appointment",
            description=(
                "You can share these AI results with your dermatologist as "
                "background information — but let them make the clinical judgement."
            ),
        ),
    ],
}

RECOMMENDATIONS_DISCLAIMER = (
    "⚠️ EDUCATIONAL GUIDANCE ONLY — These recommendations are general information "
    "for educational purposes. They are NOT medical advice and must NOT be used "
    "to make clinical decisions. Always consult a qualified dermatologist or "
    "healthcare professional for any skin concerns."
)


# ── GET /api/assessments ──────────────────────────────────────────────────────

@router.get(
    "",
    response_model=AssessmentListResponse,
    summary="List the authenticated user's assessment history",
    description=(
        "Returns all skin assessments belonging to the currently authenticated user, "
        "sorted newest-first. Users can only see their own records.\n\n"
        "**Requires** `Authorization: Bearer <token>` header."
    ),
)
def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated user's assessment history, newest first.

    Security: The query is always filtered by current_user.id — users
    cannot read another user's assessments even if they know the IDs.
    """
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    return AssessmentListResponse(
        total=len(assessments),
        assessments=[AssessmentResponse.model_validate(a) for a in assessments],
    )


# ── GET /api/assessments/{assessment_id} ─────────────────────────────────────

@router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse,
    summary="Get a single assessment by ID",
    description=(
        "Returns the full details of a specific assessment. "
        "The authenticated user must own this assessment.\n\n"
        "**Requires** `Authorization: Bearer <token>` header."
    ),
)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return a single assessment by ID.

    Raises HTTP 404 if:
      - The assessment ID does not exist.
      - The assessment belongs to a different user (privacy — don't reveal existence).
    """
    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,  # ← enforces ownership
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    return AssessmentResponse.model_validate(assessment)


# ── GET /api/assessments/{assessment_id}/recommendations ──────────────────────

@router.get(
    "/{assessment_id}/recommendations",
    response_model=RecommendationsResponse,
    summary="Get educational recommendations for an assessment",
    description=(
        "Returns general educational guidance based on the risk level of a "
        "specific assessment. **NOT medical advice.**\n\n"
        "The authenticated user must own this assessment.\n\n"
        "**Requires** `Authorization: Bearer <token>` header."
    ),
)
def get_recommendations(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return educational guidance for a specific assessment result.

    Recommendations are derived from the assessment's risk_level field.
    They are computed at request time — no separate recommendations table needed.

    IMPORTANT: These recommendations are EDUCATIONAL ONLY.
    They are NOT medical advice or clinical guidance.
    """
    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    # Retrieve recommendations for this risk level.
    # Default to "Low" if the stored value is unexpected.
    risk = assessment.risk_level if assessment.risk_level in EDUCATIONAL_GUIDANCE else "Low"
    guidance = EDUCATIONAL_GUIDANCE[risk]

    return RecommendationsResponse(
        assessment_id=assessment.id,
        risk_level=assessment.risk_level,
        predicted_class=assessment.predicted_class,
        predicted_label=assessment.predicted_label,
        confidence=assessment.confidence,
        recommendations=guidance,
        disclaimer=RECOMMENDATIONS_DISCLAIMER,
    )
