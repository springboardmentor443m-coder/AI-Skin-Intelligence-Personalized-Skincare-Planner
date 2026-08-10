from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.recommendation_engine import get_product_recommendations, get_cheaper_alternatives

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def fetch_recommendations(
    category: Optional[str] = Query(None, description="cleanser | toner | serum | moisturizer | sunscreen"),
    max_price: Optional[float] = Query(None, description="Maximum budget price limit"),
    budget_level: Optional[str] = Query(None, description="budget | midrange | premium"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        recommendations = get_product_recommendations(
            user=current_user,
            db=db,
            category=category,
            max_price=max_price,
            budget_level=budget_level
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch product recommendations: {e}"
        )


@router.get("/alternatives/{product_id}", response_model=List[ProductResponse])
def fetch_alternatives(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    try:
        alternatives = get_cheaper_alternatives(product, current_user, db)
        return alternatives
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alternatives: {e}"
        )
