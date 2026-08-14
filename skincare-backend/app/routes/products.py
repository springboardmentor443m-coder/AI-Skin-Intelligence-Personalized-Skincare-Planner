from urllib.parse import quote_plus
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.product import Product
from app.models.skin_profile import SkinProfile
from app.models.user import User

from app.services.rag_service import rag_engine

router = APIRouter(prefix="/products", tags=["Products"])

MIN_CONCERN_WEIGHT = 5.0       # ignore concerns scored below this %
MAX_CONCERNS_CONSIDERED = 4    # weight top N concerns

# ---------------------------------------------------------------------------
# High-Resolution Category Image Mapping
# ---------------------------------------------------------------------------
CATEGORY_IMAGES = {
    "Moisturizer": "https://images.unsplash.com/photo-1608248597263-00079e96447c?auto=format&fit=crop&w=600&q=80",
    "Serum": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    "Face Wash": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    "Cleanser": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    "Toner": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    "Eye Cream": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    "Exfoliator": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    "Face Mask": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    "Balm": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80",
    "Sunscreen": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    "Default": "https://images.unsplash.com/photo-1608248597263-00079e96447c?auto=format&fit=crop&w=600&q=80",
}

CONCERN_MAP = {
    "acne": ["inflammatory acne", "non inflammatory acne black heads", "non inflammatory acne white heads", "acne", "blackheads", "whiteheads", "pores"],
    "dark_spots": ["dark spots and pigmentation", "dark spots", "pigmentation"],
    "wrinkles": ["wrinkles", "aging"],
    "redness": ["Redness", "redness", "sensitivity"],
    "dryness": ["dryness", "Dry"],
    "oiliness": ["Oily", "pores", "sebum"],
}


def sanitize_url(raw_url: str, product_name: str) -> str:
    if not raw_url:
        return f"https://www.amazon.in/s?k={quote_plus(product_name)}"
    raw_url = raw_url.strip()
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        return raw_url
    if raw_url.startswith("www.") or "amazon" in raw_url or "lookfantastic" in raw_url:
        return f"https://{raw_url}"
    return f"https://www.amazon.in/s?k={quote_plus(product_name)}"


def get_image_for_product(p_name: str, category: str, existing_url: str = None) -> str:
    if existing_url and (existing_url.startswith("http://") or existing_url.startswith("https://")):
        return existing_url
    cat = category or "Default"
    return CATEGORY_IMAGES.get(cat, CATEGORY_IMAGES["Default"])


def _product_to_dict(p: Product | dict, matched_reason: str = None) -> dict:
    if isinstance(p, dict):
        price = p.get("price_inr", 500)
        mrp = p.get("mrp_inr", int(price * 1.35))
        discount_pct = int(round((1 - price / mrp) * 100))
        return {
            "id": p.get("name", "dataset_product"),
            "name": p["name"],
            "brand": p.get("brand", "SKINCARE"),
            "category": p.get("category", "Serum"),
            "image_url": get_image_for_product(p["name"], p.get("category"), p.get("image_url")),
            "price_inr": price,
            "mrp_inr": mrp,
            "discount_pct": discount_pct,
            "rating": p.get("rating", 4.4),
            "review_count": p.get("review_count", "(1,250)"),
            "purchase_url": sanitize_url(p.get("purchase_url"), p["name"]),
            "matched_because": matched_reason or "Recommended from Dataset",
            "sponsored": False,
            "delivery_info": "FREE delivery Fri, 7 Aug | Fastest delivery Tomorrow",
        }

    # Database Product Model
    price = p.price_inr or (round(p.price_gbp * 105, 0) if p.price_gbp else 500)
    mrp = int(round(price * 1.35, 0))
    discount_pct = int(round((1 - price / mrp) * 100))

    brand_name = p.brand or "SKINCARE"
    category = p.category or "Moisturizer"

    return {
        "id": str(p.id),
        "name": p.name,
        "brand": brand_name,
        "category": category,
        "image_url": get_image_for_product(p.name, category, p.image_url),
        "price_inr": int(price),
        "mrp_inr": int(mrp),
        "discount_pct": discount_pct,
        "rating": p.rating or 4.4,
        "review_count": p.review_count or "(1,250)",
        "purchase_url": sanitize_url(p.purchase_url, p.name),
        "matched_because": matched_reason or "Recommended from Dataset",
        "sponsored": False,
        "delivery_info": "FREE delivery Fri, 7 Aug | Fastest delivery Tomorrow",
    }


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    skin_type = (profile.detected_skin_type or profile.skin_type or "").capitalize() if profile else None
    concern_scores = profile.concern_scores if profile else {}
    if not concern_scores and profile:
        if profile.detected_concern:
            concern_scores = {profile.detected_concern: 85}
        elif profile.skin_concerns:
            concern_scores = {c: 80 for c in profile.skin_concerns}

    # Extract user declared allergens
    user_allergies = [a.lower().strip() for a in (profile.allergies if profile and profile.allergies else []) if a and a.lower() != "no"]
    forbidden_terms = set(user_allergies)

    def is_safe_product(p_obj: dict) -> bool:
        if not forbidden_terms:
            return True
        ingreds_str = " ".join(p_obj.get("ingredients", [])).lower()
        p_name = p_obj.get("name", "").lower()
        for term in forbidden_terms:
            if term in ingreds_str or term in p_name:
                return False
        return True

    sorted_concerns = sorted(concern_scores.items(), key=lambda x: x[1], reverse=True)
    sorted_concerns = [(c, w) for c, w in sorted_concerns if w >= MIN_CONCERN_WEIGHT]
    sorted_concerns = sorted_concerns[:MAX_CONCERNS_CONSIDERED]

    matched_results = []
    seen_names = set()

    main_concern = sorted_concerns[0][0] if sorted_concerns else (profile.detected_concern if profile else "acne")

    # 1. Retrieve products directly from RAG engine loaded from skin_product_recommendations.csv
    rag_retrieved, _ = rag_engine.retrieve_relevant_context(
        query=f"{main_concern} {skin_type or ''}",
        user_concern=main_concern,
        user_skin_type=skin_type,
        top_k=12
    )

    for rp in rag_retrieved:
        if rp["name"] not in seen_names and is_safe_product(rp):
            seen_names.add(rp["name"])
            matched_results.append(_product_to_dict(rp, rp.get("matched_because", f"Recommended for '{main_concern}'")))
            if len(matched_results) >= 8:
                break

    # 2. Database Fallback directly from Product DB table if needed
    if len(matched_results) < 6:
        db_products = db.query(Product).all()
        for p in db_products:
            p_dict = {
                "name": p.name,
                "ingredients": p.ingredients or [],
            }
            if p.name not in seen_names and is_safe_product(p_dict):
                seen_names.add(p.name)
                matched_results.append(_product_to_dict(p, "Top dataset recommendation"))
                if len(matched_results) >= 8:
                    break

    return {
        "products": matched_results,
        "based_on": {
            "weighted_concerns": dict(sorted_concerns),
            "skin_type": skin_type,
            "excluded_allergens": list(forbidden_terms),
        },
    }