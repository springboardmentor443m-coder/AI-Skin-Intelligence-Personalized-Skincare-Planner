# ==============================================================================
# backend/schemas/recommendation_response.py
# ==============================================================================

from typing import List

from pydantic import BaseModel, Field


# ==============================================================================
# ROUTINE STEP
# ==============================================================================

class RoutineStep(BaseModel):

    step: int

    action: str

    reason: str


# ==============================================================================
# RECOMMENDED PRODUCT
# ==============================================================================

class RecommendedProduct(BaseModel):

    product_type: str

    reason: str


# ==============================================================================
# RECOMMENDATION RESPONSE
# ==============================================================================

class RecommendationResponse(BaseModel):

    skin_summary: str

    morning_routine: List[RoutineStep] = Field(
        default_factory=list
    )

    night_routine: List[RoutineStep] = Field(
        default_factory=list
    )

    recommended_products: List[RecommendedProduct] = Field(
        default_factory=list
    )

    diet_recommendations: List[str] = Field(
        default_factory=list
    )

    lifestyle_recommendations: List[str] = Field(
        default_factory=list
    )

    warnings: List[str] = Field(
        default_factory=list
    )