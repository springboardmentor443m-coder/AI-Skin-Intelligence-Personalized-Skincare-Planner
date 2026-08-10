from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkincareStep(BaseModel):
    step_order: int
    action: str
    product_name: str
    ingredients: str
    instructions: str

class SkincareRoutineResponse(BaseModel):
    id: str
    user_id: str
    routine_type: str
    season: Optional[str] = None
    steps: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
