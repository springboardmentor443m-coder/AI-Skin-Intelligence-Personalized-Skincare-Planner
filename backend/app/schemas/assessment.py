from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class QuestionnaireSubmission(BaseModel):
    """Free-form answers to the skin-assessment questionnaire, e.g.
    {"age_range": "25-34", "sun_exposure": "moderate", "known_allergies": [...]}
    """

    answers: Dict[str, Any]


class VisionAnalysisResult(BaseModel):
    skin_type: Optional[str] = None
    concerns: List[str] = []
    hydration_level: Optional[str] = None
    texture_notes: Optional[str] = None
    raw: Dict[str, Any] = {}


class SkinProfileRead(BaseModel):
    id: int
    skin_type: Optional[str] = None
    concerns: List[str] = []
    questionnaire_answers: Dict[str, Any] = {}
    image_url: Optional[str] = None
    vision_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
