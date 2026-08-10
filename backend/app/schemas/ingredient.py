from pydantic import BaseModel, Field
from typing import List, Dict, Any

class IngredientAnalysisRequest(BaseModel):
    ingredients_text: str = Field(..., description="Comma-separated list of product ingredients to analyze")

class IngredientAnalysisResponse(BaseModel):
    safety_status: str = Field(..., description="safe | caution | unsafe")
    total_ingredients_analyzed: int
    safe_count: int
    flagged_count: int
    alerts: List[Dict[str, Any]]
    unsafe_pairings: List[Dict[str, Any]]
    safe_swaps: List[Dict[str, Any]]

    class Config:
        from_attributes = True
