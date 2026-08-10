import uuid
from sqlalchemy import Column, String, Float
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    
    # cleanser, toner, serum, moisturizer, sunscreen
    category = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    
    # dry, oily, combination, sensitive, normal, all
    skin_type = Column(String(50), default="all", nullable=False)
    
    # Comma-separated list of ingredients for matching/allergens analysis
    ingredients = Column(String(1000), nullable=False)
    
    rating = Column(Float, default=4.0, nullable=False)
    description = Column(String(500), nullable=True)
    image_url = Column(String(255), nullable=True)
