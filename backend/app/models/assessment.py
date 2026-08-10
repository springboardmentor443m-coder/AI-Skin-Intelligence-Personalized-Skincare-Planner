import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    health_score = Column(Integer, nullable=False)
    
    # Severity indicators: none, mild, moderate, severe
    acne_level = Column(String(30), default="none", nullable=False)
    dryness_level = Column(String(30), default="none", nullable=False)
    oiliness_level = Column(String(30), default="none", nullable=False)
    pigmentation_level = Column(String(30), default="none", nullable=False)
    sensitivity_level = Column(String(30), default="none", nullable=False)
    wrinkle_level = Column(String(30), default="none", nullable=False)
    
    # Store JSON arrays for lists
    risk_factors = Column(JSON, default=list, nullable=True)
    recommendations = Column(JSON, default=list, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship back to User
    user = relationship("User", back_populates="assessments")
