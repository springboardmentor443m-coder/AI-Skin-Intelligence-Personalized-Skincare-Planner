from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class ProgressLogCreate(BaseModel):
    routine_adherence_pct: Optional[int] = None
    notes: Optional[str] = None


class ProgressLogRead(BaseModel):
    id: int
    routine_adherence_pct: Optional[int] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    vision_analysis: Optional[Dict[str, Any]] = None
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressSummary(BaseModel):
    total_logs: int
    average_adherence_pct: Optional[float] = None
    logs: List[ProgressLogRead] = []
