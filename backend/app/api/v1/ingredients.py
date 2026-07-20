"""
Ingredient endpoints: check a proposed ingredient list against the user's
known allergies and a rules dataset of known interactions/hazards.
"""
import json
from itertools import combinations
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.recommendation_schema import (
    IngredientAnalysisResult,
    IngredientCheckRequest,
    IngredientInteraction,
)

router = APIRouter()


def _load_ingredient_rules() -> dict:
    path = Path(settings.INGREDIENT_RULES_PATH)
    if not path.exists():
        return {"interactions": [], "hazards": []}
    with open(path, "r") as f:
        return json.load(f)


@router.post("/analyze", response_model=IngredientAnalysisResult)
def analyze_ingredients(
    request: IngredientCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rules = _load_ingredient_rules()
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    known_allergies = set((profile.known_allergies or []) if profile else [])

    requested = {i.strip().lower() for i in request.ingredients}

    flagged_allergens = sorted(requested & {a.lower() for a in known_allergies})

    interaction_lookup = {
        (rule["ingredient_a"].lower(), rule["ingredient_b"].lower()): rule
        for rule in rules.get("interactions", [])
    }

    found_interactions = []
    for a, b in combinations(sorted(requested), 2):
        rule = interaction_lookup.get((a, b)) or interaction_lookup.get((b, a))
        if rule:
            found_interactions.append(
                IngredientInteraction(
                    ingredient_a=a,
                    ingredient_b=b,
                    interaction_type=rule.get("interaction_type", "conflicting"),
                    explanation=rule.get("explanation", "These ingredients may interact."),
                )
            )

    if flagged_allergens or any(i.interaction_type == "hazardous" for i in found_interactions):
        overall_safety = "unsafe"
    elif any(i.interaction_type == "conflicting" for i in found_interactions):
        overall_safety = "caution"
    else:
        overall_safety = "safe"

    return IngredientAnalysisResult(
        flagged_allergens=flagged_allergens,
        interactions=found_interactions,
        overall_safety=overall_safety,
    )
