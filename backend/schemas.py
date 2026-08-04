from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: Optional[str]
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Assessment Schemas ---
class MetricDetail(BaseModel):
    score: float
    status: str
    description: str

class AssessmentResponse(BaseModel):
    id: int
    user_id: Optional[int]
    original_image_url: str
    annotated_image_url: str
    estimated_age: int
    skin_type: str
    overall_score: float
    metrics: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatRequest(BaseModel):
    session_id: Optional[str] = "default-session"
    message: str
    assessment_id: Optional[int] = None

class ChatMessageSchema(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime
