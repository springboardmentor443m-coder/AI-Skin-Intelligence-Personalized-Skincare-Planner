from sqlalchemy import Column, Integer, String, Boolean, Float, TIMESTAMP, text, ForeignKey, Text
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), server_default=text("'USER'"))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

class SkinProfile(Base):
    __tablename__ = "skin_profile"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    skin_type = Column(String(50))
    skin_concerns = Column(String)
    allergies = Column(String)
    sensitive_skin = Column(Boolean)

class Lifestyle(Base):
    __tablename__ = "lifestyle"

    lifestyle_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    sleep_hours = Column(Float)
    water_intake = Column(Float)
    stress_level = Column(String(50))
    diet = Column(String(100))

class Progress(Base):
    __tablename__ = "progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    image_path = Column(String)
    notes = Column(Text)
