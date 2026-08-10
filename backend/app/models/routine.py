import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # morning, evening, weekly, seasonal
    routine_type = Column(String(30), nullable=False)
    
    # summer, winter, etc. (for seasonal)
    season = Column(String(30), nullable=True)
    
    # Store dynamic steps list as JSON
    steps = Column(JSON, default=list, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship back to User
    user = relationship("User", back_populates="routines")
