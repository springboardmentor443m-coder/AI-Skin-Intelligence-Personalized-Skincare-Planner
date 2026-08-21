import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user")  # user, consultant, dermatologist, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("SkinProfile", back_populates="user", uselist=False)
    assessments = relationship("SkinAssessment", back_populates="user")
    scores = relationship("SkinHealthScore", back_populates="user")
    routines = relationship("Routine", back_populates="user")
    progress_entries = relationship("ProgressEntry", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    skin_type = Column(String, nullable=True)          # oily/dry/combination/normal/sensitive
    age_group = Column(String, nullable=True)           # teen/20s/30s/40s/50+
    concerns_json = Column(Text, default="[]")          # ["acne","dark_spots",...]
    allergies_json = Column(Text, default="[]")         # ["fragrance","retinol",...]
    sensitivities_json = Column(Text, default="[]")

    lifestyle_habits_json = Column(Text, default="[]")  # ["smoking","high_stress",...]
    sleep_quality = Column(Integer, default=5)           # 1-10 self-rated
    sleep_hours = Column(Float, default=7.0)
    water_intake_liters = Column(Float, default=2.0)
    environmental_exposure = Column(String, default="moderate")  # low/moderate/high (sun, pollution)
    budget_preference = Column(String, default="mid")   # low/mid/high

    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_path = Column(String, nullable=True)
    predicted_skin_type = Column(String, nullable=True)
    predicted_confidence = Column(Float, nullable=True)

    concerns_detected_json = Column(Text, default="[]")   # ["acne","redness"]
    condition_score = Column(Float, nullable=False)        # 0-100, "skin condition assessment"
    risk_flags_json = Column(Text, default="[]")           # e.g. ["possible_sun_damage"]

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")


class SkinHealthScore(Base):
    __tablename__ = "skin_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id"), nullable=True)

    condition_score = Column(Float, nullable=False)   # weight 35%
    lifestyle_score = Column(Float, nullable=False)    # weight 20%
    sleep_score = Column(Float, nullable=False)         # weight 15%
    routine_score = Column(Float, nullable=False)       # weight 20% (routine consistency)
    hydration_score = Column(Float, nullable=False)     # weight 10%
    overall_score = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scores")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    period = Column(String, nullable=False)   # morning / evening / weekly / seasonal
    steps_json = Column(Text, nullable=False)  # ordered list of {step, product_category, reason}
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="routines")


class RoutineLog(Base):
    """One row per day a user marks a routine as completed - used for routine-consistency scoring."""
    __tablename__ = "routine_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    period = Column(String, nullable=False)  # morning / evening
    completed = Column(Boolean, default=True)


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=True)              # e.g. "Exfoliant", "Humectant"
    description = Column(Text, nullable=True)
    benefits_json = Column(Text, default="[]")
    suitable_skin_types_json = Column(Text, default="[]")
    concerns_treated_json = Column(Text, default="[]")
    conflicts_with_json = Column(Text, default="[]")       # names of ingredients it shouldn't be mixed with
    common_allergen = Column(Boolean, default=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=False)   # Face Wash / Moisturizer / Sunscreen / Serum / Toner / Treatment / Mask
    price = Column(Float, default=0.0)
    key_ingredients_json = Column(Text, default="[]")
    suitable_skin_types_json = Column(Text, default="[]")
    suitable_concerns_json = Column(Text, default="[]")
    budget_tier = Column(String, default="mid")  # low/mid/high


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score_id = Column(Integer, ForeignKey("skin_health_scores.id"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="progress_entries")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)   # routine_reminder / hydration / sleep / product_replenishment / progress_alert
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
