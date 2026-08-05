import uuid

from sqlalchemy import Column, String, Float, ARRAY
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=False)  # e.g. "Moisturizer", "Serum"
    image_url = Column(String, nullable=True)
    price_inr = Column(Float, nullable=True)     # used by our hand-curated products
    price_gbp = Column(Float, nullable=True)      # used by imported LookFantastic products
    purchase_url = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    review_count = Column(String, nullable=True)
    ingredients = Column(ARRAY(String), default=list)

    # Matching fields — auto-tagged from ingredients, or manually set
    target_concerns = Column(ARRAY(String), default=list)
    target_skin_types = Column(ARRAY(String), default=list)