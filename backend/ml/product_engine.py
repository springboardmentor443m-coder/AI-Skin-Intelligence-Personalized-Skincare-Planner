"""
Product Recommendation Engine.
Scores the seed product catalog against the user's skin type, concerns,
allergies, and budget preference.
"""
import json
import os

_PRODUCTS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")

with open(_PRODUCTS_PATH) as f:
    PRODUCTS = json.load(f)

BUDGET_ORDER = {"low": 0, "mid": 1, "high": 2}


def _suitability_score(product: dict, skin_type: str, concerns: list, allergies: list, budget: str) -> float:
    score = 0.0

    if skin_type in product["suitable_skin_types"]:
        score += 40
    matched_concerns = set(product["suitable_concerns"]) & set(concerns)
    score += min(40, len(matched_concerns) * 15)

    allergies_lower = [a.lower() for a in allergies]
    if any(ing.lower() in allergies_lower for ing in product["key_ingredients"]):
        return -1  # hard exclude - allergy conflict

    budget_gap = abs(BUDGET_ORDER.get(product["budget_tier"], 1) - BUDGET_ORDER.get(budget, 1))
    score += max(0, 20 - budget_gap * 10)

    return score


def recommend(skin_type: str, concerns: list, allergies: list, budget: str = "mid",
               category: str = None, limit: int = 5) -> list:
    pool = PRODUCTS if category is None else [p for p in PRODUCTS if p["category"] == category]
    scored = []
    for p in pool:
        s = _suitability_score(p, skin_type, concerns, allergies, budget)
        if s >= 0:
            scored.append((s, p))
    scored.sort(key=lambda x: -x[0])
    return [{**p, "suitability_score": round(s, 1)} for s, p in scored[:limit]]


def compare(product_names: list) -> list:
    return [p for p in PRODUCTS if p["name"] in product_names]


def alternatives(product_name: str, skin_type: str, concerns: list, allergies: list, limit: int = 3) -> list:
    target = next((p for p in PRODUCTS if p["name"] == product_name), None)
    if not target:
        return []
    same_category = [p for p in PRODUCTS if p["category"] == target["category"] and p["name"] != product_name]
    scored = []
    for p in same_category:
        s = _suitability_score(p, skin_type, concerns, allergies, target["budget_tier"])
        if s >= 0:
            scored.append((s, p))
    scored.sort(key=lambda x: -x[0])
    return [{**p, "suitability_score": round(s, 1)} for s, p in scored[:limit]]
