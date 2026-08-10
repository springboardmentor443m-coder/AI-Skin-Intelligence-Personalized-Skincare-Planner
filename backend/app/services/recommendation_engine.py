from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user import User
from app.models.product import Product

def get_product_recommendations(
    user: User, 
    db: Session, 
    category: Optional[str] = None, 
    max_price: Optional[float] = None, 
    budget_level: Optional[str] = None
) -> List[Product]:
    """
    Ranks skincare products based on skin type compatibility, concern targeting,
    and reviews, while strictly filtering out any containing user allergens.
    """
    profile = user.profile
    if not profile:
        # Fallback if profile is not configured
        query = db.query(Product)
        if category:
            query = query.filter(Product.category == category)
        if max_price:
            query = query.filter(Product.price <= max_price)
        return query.order_by(Product.rating.desc()).all()

    skin_type = (profile.skin_type or "normal").lower()
    concerns = [c.lower() for c in (profile.concerns or [])]
    allergies = (profile.allergy_details or "").lower().split(",")
    allergies = [a.strip() for a in allergies if a.strip()]

    # Fetch all products
    all_products = db.query(Product).all()
    scored_products = []

    for prod in all_products:
        # A. Category filter
        if category and prod.category != category:
            continue

        # B. Price filter
        if max_price and prod.price > max_price:
            continue

        # C. Budget level filter
        if budget_level:
            if budget_level == "budget" and prod.price >= 15.0:
                continue
            elif budget_level == "midrange" and (prod.price < 15.0 or prod.price > 25.0):
                continue
            elif budget_level == "premium" and prod.price <= 25.0:
                continue

        # D. Strict Allergy Filter: exclude product if any allergen matches ingredient deck
        ingredients_lower = prod.ingredients.lower()
        has_allergen = False
        for allergen in allergies:
            if allergen in ingredients_lower:
                has_allergen = True
                break
        if has_allergen:
            continue

        # E. Score calculation
        # Base score based on review rating
        score = prod.rating * 10

        # Skin Type Alignment
        prod_skin_type = prod.skin_type.lower()
        if prod_skin_type == skin_type:
            score += 50
        elif prod_skin_type == "all":
            score += 20
        elif skin_type == "sensitive" and prod_skin_type in ["dry", "normal"]:
            # Sensitive skin can tolerate some dry/normal skin products
            score += 10
        elif skin_type == "dry" and prod_skin_type in ["normal"]:
            score += 10
        elif skin_type == "oily" and prod_skin_type in ["combination", "normal"]:
            score += 15

        # Active Concerns Match
        # Check active ingredients in the product relative to user concerns
        ingredients_list = [i.strip() for i in ingredients_lower.split(",")]
        
        # 1. Acne / Sebum concern matching
        if "acne" in concerns or "oily_skin" in concerns:
            if any(act in ingredients_list for act in ["salicylic acid", "benzoyl peroxide", "zinc pca", "witch hazel"]):
                score += 30
            if "niacinamide" in ingredients_list:
                score += 20

        # 2. Dryness matching
        if "dry_skin" in concerns:
            if any(act in ingredients_list for act in ["ceramide np", "ceramide ap", "squalane", "shea butter", "hyaluronic acid"]):
                score += 30

        # 3. Wrinkles / Anti-aging matching
        if "wrinkles" in concerns or "fine_lines" in concerns:
            if any(act in ingredients_list for act in ["retinol", "peptides", "matrixyl 3000", "copper peptides", "bakuchiol"]):
                score += 30

        # 4. Pigmentation / Dark spots matching
        if "pigmentation" in concerns:
            if any(act in ingredients_list for act in ["l-ascorbic acid", "vitamin c", "ferulic acid", "niacinamide", "alpha arbutin"]):
                score += 30

        # 5. Sensitivity / Redness matching
        if "sensitive_skin" in concerns or skin_type == "sensitive":
            if any(act in ingredients_list for act in ["centella asiatica extract", "madecassoside", "panthenol", "allantoin"]):
                score += 30
            # Deduct points if drying denatured alcohol is present on sensitive skin
            if "alcohol denat" in ingredients_list or "fragrance" in ingredients_list:
                score -= 25

        scored_products.append((prod, score))

    # Sort by score descending
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    # Return just the product objects
    return [item[0] for item in scored_products]


def get_cheaper_alternatives(
    product: Product, 
    user: User, 
    db: Session
) -> List[Product]:
    """
    Finds alternative products in the same category that are cheaper,
    while ensuring allergen safety.
    """
    profile = user.profile
    allergies = []
    if profile:
        allergies = (profile.allergy_details or "").lower().split(",")
        allergies = [a.strip() for a in allergies if a.strip()]

    # Query items in same category, cheaper than input product, excluding itself
    query_items = db.query(Product).filter(
        Product.category == product.category,
        Product.price < product.price,
        Product.id != product.id
    ).all()

    safe_alternatives = []
    for item in query_items:
        # Strict allergy check
        ingredients_lower = item.ingredients.lower()
        has_allergen = False
        for allergen in allergies:
            if allergen in ingredients_lower:
                has_allergen = True
                break
        if not has_allergen:
            safe_alternatives.append(item)

    # Sort alternatives by rating descending
    safe_alternatives.sort(key=lambda x: x.rating, reverse=True)
    return safe_alternatives[:3]
