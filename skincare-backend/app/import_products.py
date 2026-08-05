"""
Imports the LookFantastic product dataset (1,138 real products) and
auto-tags each one with relevant skin concerns / skin types, based on
ingredient keyword matching.

Run this ONCE:
    python -m app.import_products
"""

import ast
import csv
import os

from app.core.database import SessionLocal, Base, engine
from app.models.product import Product

Base.metadata.create_all(bind=engine)

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "skincare_products_clean.csv")

# ---------------------------------------------------------------------------
# Ingredient -> concern/skin-type keyword rules.
# If ANY of these substrings appears in an ingredient name, the product gets
# tagged with the matching concern/skin type. Matching is case-insensitive
# and checks substrings.
# ---------------------------------------------------------------------------
CONCERN_RULES = {
    "inflammatory acne": ["salicylic acid", "benzoyl peroxide", "tea tree", "sulfur", "sulphur"],
    "non inflammatory acne black heads": ["salicylic acid", "clay", "kaolin", "charcoal", "witch hazel"],
    "non inflammatory acne white heads": ["salicylic acid", "niacinamide", "zinc"],
    "dark spots and pigmentation": [
        "vitamin c", "ascorbic acid", "niacinamide", "alpha arbutin",
        "kojic acid", "licorice", "liquorice", "tranexamic acid",
    ],
    "wrinkles": ["retinol", "retinal", "retinyl", "peptide", "collagen", "coenzyme q10", "bakuchiol"],
    "pores": ["niacinamide", "salicylic acid", "clay", "kaolin", "witch hazel", "charcoal"],
    "Redness": ["centella", "cica", "aloe", "allantoin", "panthenol", "azelaic acid", "chamomile", "oat"],
}

SKIN_TYPE_RULES = {
    "Dry": ["hyaluronic acid", "ceramide", "glycerin", "shea butter", "squalane", "urea", "sodium hyaluronate"],
    "Oily": ["salicylic acid", "niacinamide", "tea tree", "witch hazel", "clay", "kaolin", "charcoal"],
    "Sensitive": ["centella", "cica", "aloe", "allantoin", "panthenol", "oat", "chamomile"],
    "Combination": ["niacinamide", "hyaluronic acid"],
    "Normal": ["glycerin", "hyaluronic acid", "vitamin e", "tocopherol"],
}

CATEGORY_MAP = {
    "Moisturiser": "Moisturizer",
    "Cleanser": "Face Wash",
    "Serum": "Serum",
    "Eye Care": "Eye Cream",
    "Mask": "Face Mask",
    "Toner": "Toner",
    "Exfoliator": "Exfoliator",
    "Oil": "Face Oil",
    "Balm": "Balm",
    "Peel": "Peel",
    "Mist": "Face Mist",
    "Body Wash": "Body Wash",
    "Bath Salts": "Bath Salts",
    "Bath Oil": "Bath Oil",
}


def tag_product(ingredients_lower):
    concerns = set()
    for concern, keywords in CONCERN_RULES.items():
        if any(any(kw in ing for ing in ingredients_lower) for kw in keywords):
            concerns.add(concern)

    skin_types = set()
    for skin_type, keywords in SKIN_TYPE_RULES.items():
        if any(any(kw in ing for ing in ingredients_lower) for kw in keywords):
            skin_types.add(skin_type)

    return list(concerns), list(skin_types)


def parse_price(price_str):
    if not price_str:
        return None
    cleaned = price_str.replace("£", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def import_products():
    db = SessionLocal()

    existing = db.query(Product).filter(Product.price_gbp.isnot(None)).count()
    if existing > 0:
        print(f"Already imported {existing} LookFantastic products. Skipping.")
        print("(Delete rows with price_gbp set if you want to re-import.)")
        db.close()
        return

    imported = 0

    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                ingredients = ast.literal_eval(row["clean_ingreds"])
                if not isinstance(ingredients, list):
                    ingredients = []
            except Exception:
                ingredients = []

            ingredients_lower = [str(i).lower() for i in ingredients]
            concerns, skin_types = tag_product(ingredients_lower)

            category = CATEGORY_MAP.get(row["product_type"], row["product_type"])

            product = Product(
                name=row["product_name"],
                brand=None,
                category=category,
                price_gbp=parse_price(row["price"]),
                purchase_url=row["product_url"],
                ingredients=ingredients,
                target_concerns=concerns,
                target_skin_types=skin_types,
            )
            db.add(product)
            imported += 1

            if imported % 200 == 0:
                db.commit()
                print(f"  ...{imported} imported so far")

    db.commit()
    db.close()
    print(f"\nDone. Imported {imported} products.")


if __name__ == "__main__":
    import_products()