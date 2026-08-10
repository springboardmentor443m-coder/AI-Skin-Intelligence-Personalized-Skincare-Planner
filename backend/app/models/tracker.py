import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SkinLog(Base):
    __tablename__ = "skin_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    health_score = Column(Integer, nullable=False, default=95)
    hydration_level = Column(Integer, nullable=False, default=50)  # ML or scale %
    sleep_hours = Column(Integer, nullable=False, default=8)
    stress_level = Column(Integer, nullable=False, default=3)  # Scale 1-10
    
    acne_level = Column(String(30), default="none", nullable=False)
    dryness_level = Column(String(30), default="none", nullable=False)
    sensitivity_level = Column(String(30), default="none", nullable=False)
    
    notes = Column(String(500), nullable=True)
    photo_url = Column(String(500), nullable=True)

    # Relationship back to User
    user = relationship("User", back_populates="skin_logs")
