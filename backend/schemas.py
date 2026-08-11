"""
schemas.py — Pydantic Request / Response Schemas
==================================================
Phase 5: Database Integration & Authentication

What this module does:
  Defines the data shapes (schemas) for API requests and responses using
  Pydantic. FastAPI uses these schemas to:
    1. Validate incoming request bodies automatically.
    2. Serialize outgoing response data.
    3. Generate accurate Swagger / OpenAPI documentation.

  Separating schemas from ORM models is a key best practice:
    - ORM models (models.py) define the DATABASE structure.
    - Pydantic schemas (this file) define the API contract.
    - This prevents accidentally exposing database internals (e.g. hashed_password)
      in API responses.

Schema overview:
  UserCreate     — body for POST /api/auth/register
  LoginRequest   — body for POST /api/auth/login
  UserResponse   — safe user data returned in responses (no password)
  Token          — JWT access token returned after login
  TokenData      — internal payload decoded from a JWT
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Registration ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """
    Request body for POST /api/auth/register.

    Pydantic will reject the request automatically if any field is missing
    or fails validation (e.g. invalid email format, password too short).
    """

    full_name: str
    email: EmailStr           # Pydantic validates email format automatically
    password: str
    role: str = "user"        # Defaults to "user" if not provided

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
    """
    Request body for POST /api/auth/login.
    """

    email: EmailStr
    password: str


# ── User responses (no password field) ───────────────────────────────────────

class UserResponse(BaseModel):
    """
    The safe view of a User returned in API responses.

    IMPORTANT: hashed_password is intentionally excluded.
    Never return password data — not even the hash — in an API response.
    """

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    # Pydantic v2: tell Pydantic to read data from SQLAlchemy ORM attributes
    model_config = {"from_attributes": True}


# ── JWT Token ─────────────────────────────────────────────────────────────────

class Token(BaseModel):
    """
    Response body for POST /api/auth/login.

    access_token: The signed JWT string the client stores and sends
                  in the Authorization header for protected requests.
    token_type:   Always "bearer" — part of the OAuth2 standard.
    user:         The logged-in user's safe profile data.
    """

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """
    The payload decoded from a JWT token.

    sub (subject): The user's email address — used to look up the user
                   in the database when validating protected requests.
    """

    sub: Optional[str] = None


# ── Assessment schemas (Phase 10) ──────────────────────────────────────────────────

class AssessmentResponse(BaseModel):
    """
    Safe representation of a single Assessment returned in API responses.

    Never includes the user_id or internal database fields that would
    reveal information about other users or the database schema.
    """

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
    """
    Wrapper for a list of assessments returned by GET /api/assessments.

    Includes a count field so the frontend knows the total without
    having to count the items manually.
    """

    total:       int
    assessments: List[AssessmentResponse]


class RecommendationItem(BaseModel):
    """
    A single educational recommendation item.
    """
    title:       str
    description: str


class RecommendationsResponse(BaseModel):
    """
    Educational recommendations based on an assessment result.

    IMPORTANT: These are NOT medical recommendations.
    They are general educational guidance only.
    """

    assessment_id:  int
    risk_level:     str
    predicted_class: str
    predicted_label: str
    confidence:     float
    recommendations: List[RecommendationItem]
    disclaimer:     str
