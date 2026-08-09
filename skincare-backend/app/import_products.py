"""
Imports the curated Indian skin product dataset (skin_product_recommendations.csv)
and auto-tags each product with relevant skin concerns / skin types.

Run this:
    python -m app.import_products
"""

import csv
import os
import re

from app.core.database import SessionLocal, Base, engine
from app.models.product import Product

Base.metadata.create_all(bind=engine)

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "skin_product_recommendations.csv")

CONCERN_RULES = {
    "inflammatory acne": ["salicylic acid", "benzoyl peroxide", "tea tree", "sulfur", "adapalene"],
    "non inflammatory acne black heads": ["salicylic acid", "clay", "kaolin", "charcoal", "bha"],
    "non inflammatory acne white heads": ["salicylic acid", "niacinamide", "zinc", "retinol"],
    "dark spots and pigmentation": [
        "vitamin c", "ascorbic acid", "niacinamide", "alpha arbutin",
        "kojic acid", "licorice", "tranexamic acid", "melasyl"
    ],
    "wrinkles": ["retinol", "retinal", "retinyl", "peptide", "collagen", "bakuchiol", "bakuchi"],
    "pores": ["niacinamide", "salicylic acid", "clay", "kaolin", "charcoal", "bha"],
    "Redness": ["centella", "cica", "aloe", "allantoin", "panthenol", "azelaic acid", "neurosensine"],
}

SKIN_TYPE_RULES = {
    "Dry": ["hyaluronic acid", "ceramide", "glycerin", "shea butter", "squalane", "urea"],
    "Oily": ["salicylic acid", "niacinamide", "tea tree", "clay", "kaolin", "charcoal", "zinc"],
    "Sensitive": ["centella", "cica", "aloe", "allantoin", "panthenol", "neurosensine"],
    "Combination": ["niacinamide", "hyaluronic acid"],
    "Normal": ["glycerin", "hyaluronic acid", "vitamin e", "squalane"],
}

CATEGORY_MAP = {
    "Moisturizer": "Moisturizer",
    "Moisturizer + SPF": "Moisturizer",
    "Gel Moisturizer": "Moisturizer",
    "Serum": "Serum",
    "Night Serum": "Serum",
    "Serum-Cream": "Serum",
    "Face Wash": "Face Wash",
    "Cleanser": "Face Wash",
    "Toner": "Toner",
    "Exfoliating Toner": "Toner",
    "Liquid Exfoliant": "Exfoliator",
    "Exfoliator": "Exfoliator",
    "Spot Treatment": "Spot Treatment",
    "Spot Gel": "Spot Treatment",
    "Sunscreen": "Sunscreen",
    "Mask": "Face Mask",
    "Mask/Strips": "Face Mask",
    "Strips": "Face Mask",
    "Balm": "Balm",
    "Peeling Solution": "Peel",
}


def tag_product(key_ing_lower):
    concerns = set()
    for concern, keywords in CONCERN_RULES.items():
        if any(kw in key_ing_lower for kw in keywords):
            concerns.add(concern)

    skin_types = set()
    for skin_type, keywords in SKIN_TYPE_RULES.items():
        if any(kw in key_ing_lower for kw in keywords):
            skin_types.add(skin_type)

    return concerns, skin_types


def parse_price(price_str):
    if not price_str:
        return None
    cleaned = price_str.replace("₹", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_rating(rating_str):
    if not rating_str:
        return 4.3
    try:
        return float(rating_str)
    except ValueError:
        return 4.3


def import_products():
    db = SessionLocal()

    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        db.close()
        return

    # Delete previous imported records if any
    deleted = db.query(Product).delete()
    db.commit()
    print(f"Cleared {deleted} existing products from database.")

    products_map = {}

    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            p_name = row.get("product_name", "").strip()
            if not p_name:
                continue

            brand = row.get("brand", "").strip()
            cat_type = row.get("category_type", "").strip()
            cat_label = row.get("category_label", "").strip()
            key_ing = row.get("key_ingredient", "").strip()
            p_type = row.get("product_type", "").strip()
            rating = parse_rating(row.get("approx_rating"))
            price_inr = parse_price(row.get("price_inr"))
            p_url = row.get("purchase_link", "").strip()
            img_url = row.get("image_url", "").strip()

            category = CATEGORY_MAP.get(p_type, p_type)

            if p_name not in products_map:
                products_map[p_name] = {
                    "name": p_name,
                    "brand": brand,
                    "category": category,
                    "price_inr": price_inr,
                    "rating": rating,
                    "purchase_url": p_url,
                    "image_url": img_url,
                    "ingredients": [key_ing] if key_ing else [],
                    "target_concerns": set(),
                    "target_skin_types": set(),
                }

            p_data = products_map[p_name]

            # Add explicit label from CSV
            if cat_type == "skin_concern" and cat_label:
                p_data["target_concerns"].add(cat_label)
            elif cat_type == "skin_type" and cat_label:
                p_data["target_skin_types"].add(cat_label)

            # Auto-tag from ingredients
            if key_ing:
                auto_concerns, auto_skin_types = tag_product(key_ing.lower())
                p_data["target_concerns"].update(auto_concerns)
                p_data["target_skin_types"].update(auto_skin_types)

    imported = 0
    for p_name, p_data in products_map.items():
        product = Product(
            name=p_data["name"],
            brand=p_data["brand"],
            category=p_data["category"],
            price_inr=p_data["price_inr"],
            rating=p_data["rating"],
            purchase_url=p_data["purchase_url"],
            image_url=p_data["image_url"],
            ingredients=p_data["ingredients"],
            target_concerns=list(p_data["target_concerns"]),
            target_skin_types=list(p_data["target_skin_types"]),
        )
        db.add(product)
        imported += 1

    db.commit()
    db.close()
    print(f"Done. Successfully imported {imported} unique products into the database.")


if __name__ == "__main__":
    import_products()