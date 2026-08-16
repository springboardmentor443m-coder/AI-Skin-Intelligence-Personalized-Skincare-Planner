from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    user_id: int
    full_name: str
    email: str
    role: str

class SkinProfileCreate(BaseModel):
    user_id: int
    age: int
    gender: str
    skin_type: str
    skin_concerns: str
    allergies: str
    sensitive_skin: bool

class SkinProfileResponse(BaseModel):
    profile_id: int
    user_id: int
    age: int
    gender: str
    skin_type: str
    skin_concerns: str
    allergies: str
    sensitive_skin: bool

    class Config:
        from_attributes = True

class LifestyleCreate(BaseModel):
    user_id: int
    sleep_hours: float
    water_intake: float
    stress_level: str
    diet: str


class LifestyleResponse(BaseModel):
    lifestyle_id: int
    user_id: int
    sleep_hours: float
    water_intake: float
    stress_level: str
    diet: str

    class Config:
        from_attributes = True

class ProgressCreate(BaseModel):
    user_id: int
    image_path: str
    notes: str


class ProgressResponse(BaseModel):
    progress_id: int
    user_id: int
    image_path: str
    notes: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoutineAdaptationRequest(BaseModel):
    adaptations: dict[str, str]

from typing import List

class ProductRecommendation(BaseModel):
    product_name: str
    brand_name: str
    rating: float
    price_usd: float
    condition_similarity: float
    profile_similarity: float
    similarity_score: float

class ImagePredictionResponse(BaseModel):
    prediction: str
    confidence: float
    recommended_products: List[ProductRecommendation]

class ChatMessage(BaseModel):
    role: str
    content: str

class SkinMateRequest(BaseModel):
    user_id: int
    message: str
    skin_condition: str = "Normal"
    chat_history: List[ChatMessage] = []

class SkinMateResponse(BaseModel):
    response: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str