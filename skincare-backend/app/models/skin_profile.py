import uuid

from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    skin_type = Column(String, nullable=True)          # oily / dry / normal / combination
    age_group = Column(String, nullable=True)
    skin_concerns = Column(ARRAY(String), default=list)  # e.g. ["acne", "dark_spots"]
    allergies = Column(ARRAY(String), default=list)
    sensitivities = Column(ARRAY(String), default=list)

    sleep_quality = Column(String, nullable=True)        # poor / average / good
    water_intake_liters = Column(Float, nullable=True)

    # Populated later by the AI image-processing module
    detected_skin_tone = Column(String, nullable=True)
    detected_skin_type = Column(String, nullable=True)
    detected_acne_severity = Column(String, nullable=True)

    # Populated by the skin-concern detection model (photo upload)
    detected_concern = Column(String, nullable=True)
    detected_concern_confidence = Column(Float, nullable=True)

    skin_health_score = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())