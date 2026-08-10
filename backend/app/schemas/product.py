from pydantic import BaseModel
from typing import Optional

class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price: float
    skin_type: str
    ingredients: str
    rating: float
    description: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
