import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SkinProfileCreate(BaseModel):
    skin_type: Optional[str] = None
    age_group: Optional[str] = None
    skin_concerns: list[str] = []
    allergies: list[str] = []
    sensitivities: list[str] = []
    sleep_quality: Optional[str] = None
    water_intake_liters: Optional[float] = None


class SkinProfileOut(SkinProfileCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    detected_skin_tone: Optional[str] = None
    detected_skin_type: Optional[str] = None
    detected_acne_severity: Optional[str] = None
    skin_health_score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
