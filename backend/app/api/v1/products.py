"""
Product endpoints: match products from the catalog against the user's skin
profile, score suitability, and suggest alternatives to a given product.
"""
import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.recommendation_schema import ProductAlternativesResult, ProductMatch

router = APIRouter()


def _load_product_catalog() -> List[dict]:
    path = Path(settings.PRODUCT_CATALOG_PATH)
    if not path.exists():
        return []
    with open(path, "r") as f:
        return json.load(f)


def _score_product(product: dict, profile: Optional[SkinProfile]) -> tuple[float, list[str]]:
    """Lightweight rules-based suitability score, pending the trained
    recommendation model (see app/ml/pipelines/train_recommender.py)."""
    if not profile:
        return 0.5, ["No skin profile on file; showing general match"]

    score = 0.5
    reasons: list[str] = []

    suitable_types = product.get("suitable_skin_types", [])
    if profile.skin_type and profile.skin_type in suitable_types:
        score += 0.25
        reasons.append(f"Formulated for {profile.skin_type} skin")

    product_ingredients = {i.lower() for i in product.get("ingredients", [])}
    allergens = {a.lower() for a in (profile.known_allergies or [])}
    if product_ingredients & allergens:
        score = 0.0
        reasons = ["Contains an ingredient you're allergic to"]
        return score, reasons

    targets = set(product.get("targets_concerns", []))
    matched_concerns = targets & set(profile.primary_concerns or [])
    if matched_concerns:
        score += 0.15 * len(matched_concerns)
        reasons.append(f"Targets your concern(s): {', '.join(sorted(matched_concerns))}")

    return min(score, 1.0), reasons


@router.get("/match", response_model=List[ProductMatch])
def match_products(
    category: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    catalog = _load_product_catalog()
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    results = []
    for product in catalog:
        if category and product.get("category") != category:
            continue
        if max_price is not None and product.get("price", 0) > max_price:
            continue

        score, reasons = _score_product(product, profile)
        results.append(
            ProductMatch(
                product_id=product["product_id"],
                name=product["name"],
                brand=product["brand"],
                category=product["category"],
                suitability_score=score,
                price=product.get("price"),
                reasons=reasons,
            )
        )

    results.sort(key=lambda r: r.suitability_score, reverse=True)
    return results


@router.get("/{product_id}/alternatives", response_model=ProductAlternativesResult)
def get_alternatives(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    catalog = _load_product_catalog()
    target = next((p for p in catalog if p["product_id"] == product_id), None)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    candidates = [
        p for p in catalog if p["category"] == target["category"] and p["product_id"] != product_id
    ]
    scored = []
    for product in candidates:
        score, reasons = _score_product(product, profile)
        scored.append(
            ProductMatch(
                product_id=product["product_id"],
                name=product["name"],
                brand=product["brand"],
                category=product["category"],
                suitability_score=score,
                price=product.get("price"),
                reasons=reasons,
            )
        )

    scored.sort(key=lambda r: r.suitability_score, reverse=True)
    return ProductAlternativesResult(original_product_id=product_id, alternatives=scored[:5])
