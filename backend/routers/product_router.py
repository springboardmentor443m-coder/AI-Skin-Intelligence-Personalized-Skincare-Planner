import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models
from deps import get_current_user
from ml import product_engine

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
def list_products(category: Optional[str] = None):
    if category:
        return [p for p in product_engine.PRODUCTS if p["category"] == category]
    return product_engine.PRODUCTS


@router.get("/recommendations")
def recommendations(category: Optional[str] = None, user: models.User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    skin_type = (profile.skin_type if profile else None) or "normal"
    concerns = json.loads(profile.concerns_json or "[]") if profile else []
    allergies = json.loads(profile.allergies_json or "[]") if profile else []
    budget = (profile.budget_preference if profile else None) or "mid"
    return product_engine.recommend(skin_type, concerns, allergies, budget, category)


@router.get("/compare")
def compare(names: str = Query(..., description="Comma-separated product names")):
    name_list = [n.strip() for n in names.split(",")]
    return product_engine.compare(name_list)


@router.get("/{product_name}/alternatives")
def alternatives(product_name: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    skin_type = (profile.skin_type if profile else None) or "normal"
    concerns = json.loads(profile.concerns_json or "[]") if profile else []
    allergies = json.loads(profile.allergies_json or "[]") if profile else []
    return product_engine.alternatives(product_name, skin_type, concerns, allergies)
