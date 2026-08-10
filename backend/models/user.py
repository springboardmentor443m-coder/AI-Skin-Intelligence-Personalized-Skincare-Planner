from sqlalchemy import Column, Integer, String, Text, Enum, TIMESTAMP
from .base import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    google_id = Column(String(255), nullable=True)
    profile_image = Column(Text, nullable=True)
    provider = Column(Enum("local", "google"), default="local")
    created_at = Column(TIMESTAMP, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "name": self.full_name,
            "email": self.email,
            "profile_image": self.profile_image,
            "picture": self.profile_image,
            "provider": self.provider,
            "google_id": self.google_id,
        }