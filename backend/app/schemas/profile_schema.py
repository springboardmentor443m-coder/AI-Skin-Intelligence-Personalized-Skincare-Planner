"""Pydantic schemas for skin profile create/update/read operations."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SkinProfileBase(BaseModel):
    skin_type: Optional[str] = Field(None, description="oily, dry, combination, normal, sensitive")
    fitzpatrick_scale: Optional[int] = Field(None, ge=1, le=6)
    primary_concerns: List[str] = Field(default_factory=list)
    known_allergies: List[str] = Field(default_factory=list)
    diagnosed_conditions: List[str] = Field(default_factory=list)

    avg_daily_water_intake_ml: Optional[float] = Field(None, ge=0)
    avg_sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sun_exposure_hours_per_day: Optional[float] = Field(None, ge=0, le=24)
    uses_sunscreen_daily: Optional[bool] = None
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    diet_notes: Optional[str] = None
    climate_zone: Optional[str] = None


class SkinProfileCreate(SkinProfileBase):
    pass


class SkinProfileUpdate(SkinProfileBase):
    pass


class SkinProfileOut(SkinProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    latest_skin_health_score: Optional[float] = None
    latest_assessment_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
