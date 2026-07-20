"""Pydantic schemas shared by routines, ingredients, and product recommendation endpoints."""
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class RoutineStep(BaseModel):
    step: int
    action: str  # cleanse, tone, treat, moisturize, protect, exfoliate, mask
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None


class RoutineOut(BaseModel):
    id: str
    frequency: str  # morning, evening, weekly, seasonal
    season: Optional[str] = None
    steps: List[RoutineStep]
    is_ai_generated: bool
    is_active: bool


class RoutineGenerateRequest(BaseModel):
    frequency: str = Field(..., description="morning | evening | weekly | seasonal")
    season: Optional[str] = None
    budget_tier: Optional[str] = Field(None, description="budget | mid_range | premium")


class IngredientCheckRequest(BaseModel):
    ingredients: List[str]


class IngredientInteraction(BaseModel):
    ingredient_a: str
    ingredient_b: str
    interaction_type: str  # synergistic, neutral, conflicting, hazardous
    explanation: str


class IngredientAnalysisResult(BaseModel):
    flagged_allergens: List[str]
    interactions: List[IngredientInteraction]
    overall_safety: str  # safe, caution, unsafe


class ProductMatchRequest(BaseModel):
    category: Optional[str] = Field(None, description="cleanser, serum, moisturizer, sunscreen, etc.")
    max_price: Optional[float] = None


class ProductMatch(BaseModel):
    product_id: str
    name: str
    brand: str
    category: str
    suitability_score: float = Field(..., ge=0, le=1)
    price: Optional[float] = None
    reasons: List[str] = Field(default_factory=list)


class ProductAlternativesResult(BaseModel):
    original_product_id: str
    alternatives: List[ProductMatch]


class DashboardSummary(BaseModel):
    """Generic dashboard payload shape, specialized per role in analytics.py."""
    metrics: Dict[str, float]
    recent_activity: List[Dict[str, str]]
