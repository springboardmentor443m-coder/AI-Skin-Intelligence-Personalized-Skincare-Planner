"""
One-time ETL: converts the raw Sephora product_info.csv (from Kaggle, sent
by the user) into backend/data/products.json in the shape the app expects.

Run manually whenever the source CSV changes:
    python build_products_from_csv.py /path/to/product_info.csv

Maps Sephora's secondary/tertiary categories -> our 7 routine categories,
parses the `highlights` column for skin-type suitability and concern tags,
and pulls key ingredients by matching against our curated ingredient list.
"""
import sys
import json
import ast
import os
import pandas as pd

OUR_INGREDIENTS = [
    "Retinol", "Niacinamide", "Vitamin C", "Hyaluronic Acid", "Salicylic Acid",
    "Ceramides", "Peptides", "AHA", "Benzoyl Peroxide", "Fragrance",
    "Zinc Oxide", "Centella Asiatica",
]

# Sephora (secondary, tertiary) -> our internal product category
CATEGORY_MAP = {
    ("Cleansers", "Face Wash & Cleansers"): "Face Wash",
    ("Cleansers", "Toners"): "Toner",
    ("Treatments", "Face Serums"): "Serum",
    ("Treatments", "Blemish & Acne Treatments"): "Treatment",
    ("Treatments", "Facial Peels"): "Treatment",
    ("Moisturizers", "Moisturizers"): "Moisturizer",
    ("Moisturizers", "Night Creams"): "Moisturizer",
    ("Sunscreen", None): "Sunscreen",  # secondary_category alone is enough here
    ("Masks", None): "Face Masks",
}

SKIN_TYPE_TAGS = {
    "dry": "dry", "oily": "oily", "combo": "combination", "combination": "combination",
    "normal": "normal", "sensitive": "sensitive",
}

CONCERN_TAGS = {
    "dryness": "dry_skin", "redness": "redness", "dullness/uneven texture": "uneven_skin_tone",
    "acne": "acne", "dark spots": "dark_spots", "hyperpigmentation": "hyperpigmentation",
    "anti-aging": "wrinkles", "fine lines": "fine_lines", "loss of firmness": "wrinkles",
    "dark circles": "dark_spots", "pores": "enlarged_pores", "oiliness": "oily_skin",
}


def parse_list_field(val):
    if not isinstance(val, str) or not val.strip():
        return []
    try:
        return ast.literal_eval(val)
    except Exception:
        return []


def extract_skin_types(highlights: list) -> list:
    found = set()
    for h in highlights:
        h_lower = h.lower()
        if "best for" in h_lower:
            for key, mapped in SKIN_TYPE_TAGS.items():
                if key in h_lower:
                    found.add(mapped)
    return sorted(found) if found else ["normal", "dry", "oily", "combination", "sensitive"]


def extract_concerns(highlights: list) -> list:
    found = set()
    for h in highlights:
        h_lower = h.lower()
        for key, mapped in CONCERN_TAGS.items():
            if key in h_lower:
                found.add(mapped)
    return sorted(found)


def extract_key_ingredients(ingredients_field, product_name: str) -> list:
    text = ""
    parsed = parse_list_field(ingredients_field)
    if parsed:
        text = " ".join(str(p) for p in parsed).lower()
    else:
        text = str(ingredients_field).lower()
    found = [ing for ing in OUR_INGREDIENTS if ing.lower() in text]
    return found


def budget_tier(price: float, low_cut: float, high_cut: float) -> str:
    if price <= low_cut:
        return "low"
    if price >= high_cut:
        return "high"
    return "mid"


def map_category(secondary: str, tertiary: str):
    if pd.isna(secondary):
        return None
    for (sec, tert), mapped in CATEGORY_MAP.items():
        if sec == secondary and (tert is None or tert == tertiary):
            return mapped
    return None


def build(csv_path: str, out_path: str, per_category_limit: int = 40):
    df = pd.read_csv(csv_path)
    sk = df[df["primary_category"] == "Skincare"].copy()
    sk = sk.dropna(subset=["price_usd"])

    sk["mapped_category"] = sk.apply(
        lambda r: map_category(r["secondary_category"], r["tertiary_category"]), axis=1
    )
    sk = sk[sk["mapped_category"].notna()]

    low_cut, high_cut = sk["price_usd"].quantile([0.33, 0.66])

    products = []
    # prefer well-reviewed, well-rated products so the seed catalog is good quality
    sk["quality_signal"] = sk["rating"].fillna(0) * (sk["reviews"].fillna(0) + 1).apply(lambda x: x ** 0.3)
    sk = sk.sort_values("quality_signal", ascending=False)

    counts = {}
    for _, row in sk.iterrows():
        cat = row["mapped_category"]
        counts.setdefault(cat, 0)
        if counts[cat] >= per_category_limit:
            continue

        highlights = parse_list_field(row.get("highlights"))
        key_ingredients = extract_key_ingredients(row.get("ingredients"), row["product_name"])
        suitable_concerns = extract_concerns(highlights)

        products.append({
            "name": str(row["product_name"]),
            "brand": str(row["brand_name"]) if pd.notna(row["brand_name"]) else None,
            "category": cat,
            "price": round(float(row["price_usd"]), 2),
            "key_ingredients": key_ingredients,
            "suitable_skin_types": extract_skin_types(highlights),
            "suitable_concerns": suitable_concerns,
            "budget_tier": budget_tier(row["price_usd"], low_cut, high_cut),
        })
        counts[cat] += 1

    with open(out_path, "w") as f:
        json.dump(products, f, indent=2)

    print(f"Wrote {len(products)} products to {out_path}")
    for cat, n in counts.items():
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "product_info.csv"
    out_path = os.path.join(os.path.dirname(__file__), "data", "products.json")
    build(csv_path, out_path)
