from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SkinAssessmentResponse(BaseModel):
    id: str
    user_id: str
    health_score: int
    acne_level: str
    dryness_level: str
    oiliness_level: str
    pigmentation_level: str
    sensitivity_level: str
    wrinkle_level: str
    risk_factors: List[str]
    recommendations: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentCalculate(BaseModel):
    # Optional manual input indicators if the user wants to force-test levels
    forced_skin_type: Optional[str] = None
    forced_concerns: Optional[List[str]] = None
