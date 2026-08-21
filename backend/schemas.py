from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "user"   # user / consultant / dermatologist / admin


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str

    class Config:
        from_attributes = True


# ---------- Skin Profile ----------
class SkinProfileIn(BaseModel):
    skin_type: Optional[str] = None
    age_group: Optional[str] = None
    concerns: List[str] = []
    allergies: List[str] = []
    sensitivities: List[str] = []
    lifestyle_habits: List[str] = []
    sleep_quality: int = 5
    sleep_hours: float = 7.0
    water_intake_liters: float = 2.0
    environmental_exposure: str = "moderate"
    budget_preference: str = "mid"


class SkinProfileOut(SkinProfileIn):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ---------- Assessment ----------
class AssessmentOut(BaseModel):
    id: int
    predicted_skin_type: Optional[str]
    predicted_confidence: Optional[float]
    concerns_detected: List[str]
    condition_score: float
    risk_flags: List[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ---------- Score ----------
class ScoreOut(BaseModel):
    id: int
    condition_score: float
    lifestyle_score: float
    sleep_score: float
    routine_score: float
    hydration_score: float
    overall_score: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ---------- Routine ----------
class RoutineStep(BaseModel):
    order: int
    step: str
    category: str
    reason: str


class RoutineOut(BaseModel):
    id: int
    period: str
    steps: List[RoutineStep]
    generated_at: datetime.datetime

    class Config:
        from_attributes = True


# ---------- Ingredient ----------
class IngredientOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    description: Optional[str]
    benefits: List[str]
    suitable_skin_types: List[str]
    concerns_treated: List[str]
    conflicts_with: List[str]
    common_allergen: bool

    class Config:
        from_attributes = True


class IngredientCheckRequest(BaseModel):
    ingredient_names: List[str]


# ---------- Product ----------
class ProductOut(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: str
    price: float
    key_ingredients: List[str]
    suitable_skin_types: List[str]
    suitable_concerns: List[str]
    budget_tier: str

    class Config:
        from_attributes = True


# ---------- Progress ----------
class ProgressEntryIn(BaseModel):
    note: Optional[str] = None


class ProgressEntryOut(BaseModel):
    id: int
    note: Optional[str]
    created_at: datetime.datetime
    overall_score: Optional[float] = None

    class Config:
        from_attributes = True


# ---------- Notification ----------
class NotificationOut(BaseModel):
    id: int
    type: str
    message: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
