from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class RoutineStepRead(BaseModel):
    id: int
    time_of_day: str
    order: int
    product_type: str
    instruction: str
    is_completed_today: bool

    model_config = ConfigDict(from_attributes=True)


class RoutineRead(BaseModel):
    id: int
    skin_profile_id: int
    summary: Optional[str] = None
    steps: List[RoutineStepRead] = []

    model_config = ConfigDict(from_attributes=True)


class RoutineStepUpdate(BaseModel):
    is_completed_today: bool
