# ==============================================================================
# backend/schemas/recommendation_context.py
# ==============================================================================

from dataclasses import dataclass
from pathlib import Path


# ==============================================================================
# PREDICTION
# ==============================================================================

@dataclass
class Prediction:

    label: str

    confidence: float


# ==============================================================================
# USER PROFILE
# ==============================================================================

@dataclass
class UserProfile:

    age: int

    gender: str

    country: str

    skin_type: str

    budget: str

    additional_details: str = ""


# ==============================================================================
# RECOMMENDATION CONTEXT
# ==============================================================================

@dataclass
class RecommendationContext:

    image_path: Path

    predictions: list[Prediction]

    user_profile: UserProfile