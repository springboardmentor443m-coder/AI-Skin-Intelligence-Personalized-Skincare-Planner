import os
import joblib

BASE_DIR = os.path.dirname(__file__)

df = joblib.load(
    os.path.join(BASE_DIR, "saved_models", "products.pkl")
)

INGREDIENT_MAP = {
    "Acne": [
        "Salicylic Acid",
        "Niacinamide",
        "Benzoyl Peroxide"
    ],
    "Dark Spots": [
        "Vitamin C",
        "Niacinamide",
        "Alpha Arbutin"
    ],
    "Wrinkles": [
        "Retinol",
        "Peptides",
        "Hyaluronic Acid"
    ],
    "Dry": [
        "Ceramides",
        "Glycerin",
        "Hyaluronic Acid"
    ],
    "Oily": [
        "Salicylic Acid",
        "Niacinamide"
    ],
    "Sensitive": [
        "Centella",
        "Aloe Vera",
        "Oat"
    ]
}

def search_products(ingredients):

    matched_products = df[
        df["ingredients"].fillna("").str.contains(
            "|".join(ingredients),
            case=False,
            regex=True
        )
    ]

    return matched_products

def get_top_products(products, top_n=5):

    if products.empty:
        return []

    top_products = products.sort_values(
        by="rating",
        ascending=False
    ).head(top_n)

    return top_products[
        [
            "product_name",
            "brand_name",
            "rating",
            "price_usd"
        ]
    ].to_dict(orient="records")

def recommend_from_profile(profile, lifestyle=None, top_n=5):

    concerns = [
        concern.strip()
        for concern in profile.skin_concerns.split(",")
    ]

    ingredients = []

    for concern in concerns:
        if concern in INGREDIENT_MAP:
            ingredients.extend(INGREDIENT_MAP[concern])

    if profile.skin_type in INGREDIENT_MAP:
        ingredients.extend(
            INGREDIENT_MAP[profile.skin_type]
        )

    ingredients = list(set(ingredients))

    matched_products = search_products(ingredients)

    return get_top_products(
        matched_products,
        top_n
    )