from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.product import Product
from app.models.skin_profile import SkinProfile
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])

MIN_CONCERN_WEIGHT = 5.0       # ignore concerns scored below this %
MAX_CONCERNS_CONSIDERED = 4    # only weight the top N concerns
PRODUCTS_PER_CONCERN = 3       # how many products to pull per matched concern


def _product_to_dict(p: Product, matched_reason: str = None) -> dict:
    return {
        "id": str(p.id),
        "name": p.name,
        "category": p.category,
        "price_inr": p.price_inr,
        "price_gbp": p.price_gbp,
        "rating": p.rating,
        "review_count": p.review_count,
        "purchase_url": p.purchase_url,
        "matched_because": matched_reason,
    }


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Confidence-weighted product recommendations — uses ALL concern scores
    from the last photo analysis (not just the top pick), so two users with
    different score breakdowns get genuinely different product mixes.
    """
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    if not profile:
        return {"products": [], "message": "Create a skin profile first to get recommendations."}

    skin_type = (profile.detected_skin_type or profile.skin_type or "").capitalize() or None

    results = []
    seen_ids = set()

    # Use the FULL concern score breakdown, sorted by weight, above threshold
    concern_scores = profile.concern_scores or {}
    sorted_concerns = sorted(concern_scores.items(), key=lambda x: x[1], reverse=True)
    sorted_concerns = [(c, w) for c, w in sorted_concerns if w >= MIN_CONCERN_WEIGHT]
    sorted_concerns = sorted_concerns[:MAX_CONCERNS_CONSIDERED]

    for concern, weight in sorted_concerns:
        matches = (
            db.query(Product)
            .filter(Product.target_concerns.any(concern))
            .order_by(Product.rating.desc().nulls_last())
            .limit(PRODUCTS_PER_CONCERN)
            .all()
        )
        for p in matches:
            if p.id not in seen_ids:
                seen_ids.add(p.id)
                results.append(
                    _product_to_dict(p, f"Matches '{concern}' ({weight}% detected)")
                )

    if skin_type:
        type_matches = (
            db.query(Product)
            .filter(Product.target_skin_types.any(skin_type))
            .order_by(Product.rating.desc().nulls_last())
            .limit(PRODUCTS_PER_CONCERN)
            .all()
        )
        for p in type_matches:
            if p.id not in seen_ids:
                seen_ids.add(p.id)
                results.append(_product_to_dict(p, f"Suits your '{skin_type}' skin type"))

    if not results:
        fallback = db.query(Product).order_by(Product.rating.desc().nulls_last()).limit(6).all()
        results = [_product_to_dict(p, "Popular pick") for p in fallback]

    return {
        "products": results,
        "based_on": {
            "weighted_concerns": dict(sorted_concerns),
            "skin_type": skin_type,
        },
    }