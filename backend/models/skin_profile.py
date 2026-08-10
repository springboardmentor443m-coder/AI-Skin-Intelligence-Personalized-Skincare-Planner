from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from .base import Base

class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True, default=25)
    gender = Column(String(20), nullable=True, default="Unspecified")
    skin_type = Column(String(50), nullable=True, default="Combination")
    skin_concerns = Column(Text, nullable=True, default="[]")  # Stored as JSON string list
    allergies = Column(Text, nullable=True, default="None")
    skin_sensitivity = Column(String(50), nullable=True, default="Moderate")
    sleep_hours = Column(Float, nullable=True, default=7.5)
    water_intake = Column(Float, nullable=True, default=2.5)  # Liters / day
    lifestyle = Column(String(50), nullable=True, default="Moderate")
    environmental_exposure = Column(String(50), nullable=True, default="Medium")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        import json
        concerns = []
        if self.skin_concerns:
            try:
                concerns = json.loads(self.skin_concerns)
            except Exception:
                concerns = [c.strip() for c in self.skin_concerns.split(",") if c.strip()]

        return {
            "id": self.id,
            "user_id": self.user_id,
            "age": self.age,
            "gender": self.gender,
            "skin_type": self.skin_type,
            "skin_concerns": concerns,
            "allergies": self.allergies,
            "skin_sensitivity": self.skin_sensitivity,
            "sleep_hours": self.sleep_hours,
            "water_intake": self.water_intake,
            "lifestyle": self.lifestyle,
            "environmental_exposure": self.environmental_exposure,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
