from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import SkincareProduct, User
from schemas import (
    SkincareProductListResponse,
    SkincareProductRequest,
    SkincareProductResponse,
)

router = APIRouter(prefix="/products", tags=["Skincare Products"])


@router.get("", response_model=SkincareProductListResponse)
def list_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    products = (
        db.query(SkincareProduct)
        .filter(SkincareProduct.user_id == current_user.id)
        .order_by(SkincareProduct.created_at.desc())
        .all()
    )
    return SkincareProductListResponse(
        total=len(products),
        products=[SkincareProductResponse.model_validate(product) for product in products],
    )


@router.post("", response_model=SkincareProductResponse, status_code=status.HTTP_201_CREATED)
def add_product(
    payload: SkincareProductRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = SkincareProduct(user_id=current_user.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(SkincareProduct)
        .filter(SkincareProduct.id == product_id, SkincareProduct.user_id == current_user.id)
        .first()
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    db.delete(product)
    db.commit()
    return None
