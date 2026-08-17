"""
schemas.py — Pydantic Request / Response Schemas
==================================================
Phase 5: Database Integration & Authentication
Phase 11: Personalized Skin Analysis schemas added
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Registration ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Request body for POST /api/auth/register."""
    full_name: str
    email: EmailStr
    password: str
    role: str = "user"

    @field_validator("full_name")
    @classmethod
    def full_name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name must not be blank.")
        if len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        allowed = {"user", "skincare_consultant", "dermatologist"}
        if v not in allowed:
            raise ValueError(
                f"Role must be one of: {', '.join(sorted(allowed))}. "
                "Administrator accounts cannot be self-registered."
            )
        return v


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """Request body for POST /api/auth/login."""
    email: EmailStr
    password: str


# ── User responses ────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """
    The safe view of a User returned in API responses.
    IMPORTANT: hashed_password is intentionally excluded.
    """
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ── JWT Token ─────────────────────────────────────────────────────────────────

class Token(BaseModel):
    """Response body for POST /api/auth/login."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """The payload decoded from a JWT token."""
    sub: Optional[str] = None


# ── Assessment schemas (Phase 10) ─────────────────────────────────────────────

class AssessmentResponse(BaseModel):
    """Safe representation of a single Assessment."""
    id:              int
    predicted_class: str
    predicted_label: str
    confidence:      float
    risk_level:      str
    all_scores:      Dict[str, float]
    disclaimer:      Optional[str] = None
    created_at:      datetime
    model_config = {"from_attributes": True}


class AssessmentListResponse(BaseModel):
    """Wrapper for a list of assessments."""
    total:       int
    assessments: List[AssessmentResponse]


class RecommendationItem(BaseModel):
    """A single educational recommendation item."""
    title:       str
    description: str


class RecommendationsResponse(BaseModel):
    """
    Educational recommendations based on an assessment result.
    IMPORTANT: These are NOT medical recommendations.
    """
    assessment_id:   int
    risk_level:      str
    predicted_class: str
    predicted_label: str
    confidence:      float
    recommendations: List[RecommendationItem]
    disclaimer:      str


# ── SkinProfile schemas (Phase 11) ────────────────────────────────────────────

class AllergyItem(BaseModel):
    """A single allergy/sensitivity item."""
    name:     str
    reaction: Optional[str] = None
    notes:    Optional[str] = None


class SkinProfileRequest(BaseModel):
    """
    Request body for POST /api/skin-profile (create or update).
    All fields optional to allow partial updates.
    """
    age:                  Optional[int]               = None
    age_group:            Optional[str]               = None
    gender:               Optional[str]               = None
    skin_type:            Optional[str]               = None
    skin_concerns:        Optional[List[str]]         = None
    additional_concerns:  Optional[str]               = None
    allergies_known:      Optional[str]               = None
    allergy_list:         Optional[List[AllergyItem]] = None
    sensitive_skin:       Optional[str]               = None
    previous_irritation:  Optional[str]               = None
    ingredients_to_avoid: Optional[List[str]]         = None
    sleep_duration:       Optional[str]               = None
    sleep_quality:        Optional[str]               = None
    water_intake:         Optional[str]               = None
    sun_exposure:         Optional[str]               = None
    outdoor_activity:     Optional[str]               = None
    stress_level:         Optional[str]               = None
    location:             Optional[str]               = None
    climate:              Optional[str]               = None
    preferred_language:   Optional[str]               = "en"


class SkinProfileResponse(BaseModel):
    """Safe representation of a SkinProfile returned in API responses."""
    id:                   int
    age:                  Optional[int]       = None
    age_group:            Optional[str]       = None
    gender:               Optional[str]       = None
    skin_type:            Optional[str]       = None
    skin_concerns:        Optional[List[str]] = None
    additional_concerns:  Optional[str]       = None
    allergies_known:      Optional[str]       = None
    allergy_list:         Optional[List[Any]] = None
    sensitive_skin:       Optional[str]       = None
    previous_irritation:  Optional[str]       = None
    ingredients_to_avoid: Optional[List[str]] = None
    sleep_duration:       Optional[str]       = None
    sleep_quality:        Optional[str]       = None
    water_intake:         Optional[str]       = None
    sun_exposure:         Optional[str]       = None
    outdoor_activity:     Optional[str]       = None
    stress_level:         Optional[str]       = None
    location:             Optional[str]       = None
    climate:              Optional[str]       = None
    preferred_language:   Optional[str]       = "en"
    created_at:           datetime
    updated_at:           datetime
    model_config = {"from_attributes": True}


# ── SkincareProduct schemas (Phase 11) ────────────────────────────────────────

class SkincareProductRequest(BaseModel):
    """Request body for POST/PUT /api/products."""
    product_name:      str
    brand:             Optional[str] = None
    category:          Optional[str] = None
    usage_time:        Optional[str] = None
    usage_frequency:   Optional[str] = None
    duration_of_use:   Optional[str] = None
    caused_irritation: Optional[str] = None
    notes:             Optional[str] = None

    @field_validator("product_name")
    @classmethod
    def product_name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Product name must not be blank.")
        return v.strip()


class SkincareProductResponse(BaseModel):
    """Safe representation of a SkincareProduct."""
    id:                int
    product_name:      str
    brand:             Optional[str] = None
    category:          Optional[str] = None
    usage_time:        Optional[str] = None
    usage_frequency:   Optional[str] = None
    duration_of_use:   Optional[str] = None
    caused_irritation: Optional[str] = None
    notes:             Optional[str] = None
    created_at:        datetime
    model_config = {"from_attributes": True}


class SkincareProductListResponse(BaseModel):
    """Wrapper for a list of skincare products."""
    total:    int
    products: List[SkincareProductResponse]


# ── MedicalReport schemas (Phase 11) ──────────────────────────────────────────

class MedicalReportResponse(BaseModel):
    """Safe representation of a MedicalReport (metadata only)."""
    id:          int
    file_name:   str
    file_type:   str
    file_size:   int
    upload_date: datetime
    model_config = {"from_attributes": True}


class MedicalReportListResponse(BaseModel):
    """Wrapper for a list of medical report metadata."""
    total:   int
    reports: List[MedicalReportResponse]


# ── PreviousSkinHistory schemas (Phase 11) ────────────────────────────────────

class PreviousProductItem(BaseModel):
    """A single previous skincare product entry."""
    name:              str
    brand:             Optional[str] = None
    category:          Optional[str] = None
    usage:             Optional[str] = None
    caused_irritation: Optional[str] = None
    notes:             Optional[str] = None


class PreviousSkinHistoryRequest(BaseModel):
    """
    Request body for POST /api/skin-history (create or update).
    All fields are optional.
    """
    condition_name:          Optional[str]                      = None
    previous_analysis_date:  Optional[str]                      = None
    previous_diagnosis:      Optional[str]                      = None
    previous_treatment:      Optional[str]                      = None
    previous_symptoms:       Optional[str]                      = None
    dermatologist_consulted: Optional[str]                      = None
    notes:                   Optional[str]                      = None
    previous_ai_result:      Optional[str]                      = None
    previous_concerns:       Optional[str]                      = None
    previous_products:       Optional[List[PreviousProductItem]] = None
    skin_outcome:            Optional[str]                      = None
    changes_since:           Optional[List[str]]                = None
    changes_description:     Optional[str]                      = None


class PreviousSkinHistoryResponse(BaseModel):
    """Safe representation of PreviousSkinHistory."""
    id:                      int
    condition_name:          Optional[str]       = None
    previous_analysis_date:  Optional[str]       = None
    previous_diagnosis:      Optional[str]       = None
    previous_treatment:      Optional[str]       = None
    previous_symptoms:       Optional[str]       = None
    dermatologist_consulted: Optional[str]       = None
    notes:                   Optional[str]       = None
    previous_ai_result:      Optional[str]       = None
    previous_concerns:       Optional[str]       = None
    previous_products:       Optional[List[Any]] = None
    skin_outcome:            Optional[str]       = None
    changes_since:           Optional[List[str]] = None
    changes_description:     Optional[str]       = None
    created_at:              datetime
    updated_at:              datetime
    model_config = {"from_attributes": True}


# ── Recommendation schemas (Phase 12) ─────────────────────────────────────────

class RecommendationRequest(BaseModel):
    """Request body for POST /api/recommend."""
    predicted_class:       str
    risk_level:            str
    skin_type:             Optional[str]  = None
    has_previous_analysis: Optional[bool] = False
    language:              Optional[str]  = "en"   # ISO 639-1 language code, e.g. "hi", "te"


class ProductItem(BaseModel):
    """A single skincare product recommendation."""
    id:                  str
    name:                str
    category:            str
    image_url:           Optional[str]       = None
    description:         str
    why_useful:          str
    key_features:        List[str]
    suitable_skin_types: List[str]
    how_to_use:          str
    precautions:         str
    price_range:         Optional[str]       = None
    product_link:        Optional[str]       = None


class RoutineStep(BaseModel):
    """A single step in a skincare routine."""
    step:        int
    title:       str
    description: str


class DaytimeSection(BaseModel):
    """Daytime dos and avoids."""
    do:    List[str]
    avoid: List[str]


class DailyRoutineData(BaseModel):
    """Structured daily skincare routine."""
    morning:      List[RoutineStep]
    daytime:      DaytimeSection
    night:        List[RoutineStep]
    daily_habits: List[str]


class DermatologistGuidanceData(BaseModel):
    """Dermatologist consultation guidance."""
    urgency:         str        # "routine" | "soon" | "urgent"
    urgency_message: str
    warning_signs:   List[str]
    general_advice:  str


class RecommendationResponse(BaseModel):
    """Full recommendation API response."""
    predicted_class:         str
    risk_level:              str
    products:                List[ProductItem]
    routine:                 DailyRoutineData
    dermatologist_guidance:  DermatologistGuidanceData
    disclaimer:              str
    safety_note:             Optional[str] = None
