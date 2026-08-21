"""
Ingredient Intelligence Module.
Loads the curated ingredient DB and provides:
  - suitability_for(skin_type, concerns)
  - check_interactions(ingredient_names) -> conflicts
  - check_allergies(ingredient_names, user_allergies) -> flagged
"""
import json
import os

_INGREDIENTS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ingredients.json")

with open(_INGREDIENTS_PATH) as f:
    INGREDIENTS = json.load(f)

_BY_NAME = {i["name"].lower(): i for i in INGREDIENTS}


def get_ingredient(name: str):
    return _BY_NAME.get(name.lower())


def suitable_ingredients(skin_type: str, concerns: list) -> list:
    results = []
    for ing in INGREDIENTS:
        type_match = skin_type in ing["suitable_skin_types"]
        concern_match = any(c in ing["concerns_treated"] for c in concerns)
        if type_match and (not concerns or concern_match):
            results.append(ing)
    # sort ingredients that match a concern to the top
    results.sort(key=lambda i: -len(set(i["concerns_treated"]) & set(concerns)))
    return results


def check_interactions(ingredient_names: list) -> list:
    """Returns list of {a, b, note} for every conflicting pair found."""
    conflicts = []
    names_lower = [n.lower() for n in ingredient_names]
    for name in ingredient_names:
        ing = get_ingredient(name)
        if not ing:
            continue
        for conflict_name in ing.get("conflicts_with", []):
            if conflict_name.lower() in names_lower:
                pair = tuple(sorted([name, conflict_name]))
                note = f"{pair[0]} and {pair[1]} can irritate skin or cancel each other out when layered together."
                if {"a": pair[0], "b": pair[1], "note": note} not in conflicts:
                    conflicts.append({"a": pair[0], "b": pair[1], "note": note})
    return conflicts


def check_allergies(ingredient_names: list, user_allergies: list) -> list:
    """Returns list of ingredient names that should be flagged for this user."""
    flagged = []
    user_allergies_lower = [a.lower() for a in user_allergies]
    for name in ingredient_names:
        ing = get_ingredient(name)
        if not ing:
            continue
        if name.lower() in user_allergies_lower:
            flagged.append(name)
        elif ing.get("common_allergen") and ing["name"].lower() in user_allergies_lower:
            flagged.append(name)
    return flagged
