from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SkinLogBase(BaseModel):
    health_score: int = Field(95, ge=0, le=100)
    hydration_level: int = Field(50, ge=0, le=100)
    sleep_hours: int = Field(8, ge=0, le=24)
    stress_level: int = Field(3, ge=1, le=10)
    
    acne_level: str = "none"
    dryness_level: str = "none"
    sensitivity_level: str = "none"

    
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class SkinLogCreate(SkinLogBase):
    pass

class SkinLogResponse(SkinLogBase):
    id: str
    user_id: str
    logged_at: datetime

    class Config:
        from_attributes = True
