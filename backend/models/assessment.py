from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class SkinAnalysisResult(BaseModel):
    prediction: str
    confidence: float
    all_probabilities: Dict[str, float]

class AssessmentResponse(BaseModel):
    skin_type: SkinAnalysisResult
    skin_concerns: SkinAnalysisResult

class AssessmentRecord(BaseModel):
    user_id: Optional[str] = "anonymous" # For now, before auth
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    analysis: AssessmentResponse
    image_filename: str
