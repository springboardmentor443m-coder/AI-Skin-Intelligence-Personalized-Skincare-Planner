"""Pydantic schemas for triggering and returning AI skin assessments."""
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class AssessmentRequest(BaseModel):
    """
    Input for a new assessment. `image_base64` is optional — assessments can run
    purely on tabular skin-profile data, or combine both image + tabular features.
    """
    image_base64: Optional[str] = Field(None, description="Base64-encoded face/skin image, optional")
    notes: Optional[str] = None


class ConcernPrediction(BaseModel):
    concern: str  # e.g. "acne", "hyperpigmentation", "wrinkles", "dehydration"
    confidence: float = Field(..., ge=0, le=1)
    severity: str  # mild, moderate, severe


class AssessmentResult(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    user_id: str
    skin_health_score: float = Field(..., ge=0, le=100)
    predicted_concerns: List[ConcernPrediction]
    feature_importance: Optional[Dict[str, float]] = None
    model_version: str
    created_at: datetime


class AssessmentHistoryItem(BaseModel):
    id: str
    skin_health_score: float
    created_at: datetime
