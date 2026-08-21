"""
Personalized Routine Generator.
Builds AM/PM (and optionally weekly) routines from skin type + prioritized
concerns, picking suitable ingredients per step and avoiding known
allergens/interactions.
"""
from . import ingredient_engine

MORNING_STEPS = ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"]
EVENING_STEPS = ["Cleanser", "Toner", "Treatment", "Serum", "Moisturizer"]

STEP_TO_CATEGORY = {
    "Cleanser": "Face Wash",
    "Toner": "Toner",
    "Serum": "Serum",
    "Treatment": "Treatment",
    "Moisturizer": "Moisturizer",
    "Sunscreen": "Sunscreen",
}


def _pick_ingredient_for_step(step: str, skin_type: str, concerns: list, allergies: list,
                               already_used: set, used_actives: set):
    """
    Walks the ranked candidate list and returns the first one that is
    allergy-safe, not already used elsewhere in this routine, and doesn't
    conflict with an ingredient already placed earlier in the routine.
    Falls back progressively (allow repeats, then allow conflicts) rather
    than leaving a step empty just because the top pick didn't work out.
    """
    candidates = ingredient_engine.suitable_ingredients(skin_type, concerns)
    allergies_lower = [a.lower() for a in allergies]
    safe = [c for c in candidates if c["name"].lower() not in allergies_lower]
    if not safe:
        return None

    def conflicts(name):
        if not used_actives:
            return False
        return bool(ingredient_engine.check_interactions(list(used_actives) + [name]))

    # 1) best case: unused AND non-conflicting
    for c in safe:
        if c["name"] not in already_used and not conflicts(c["name"]):
            return c
    # 2) relax: allow reuse, still avoid conflicts
    for c in safe:
        if not conflicts(c["name"]):
            return c
    # 3) last resort: just avoid allergies
    return safe[0]


def generate_routine(period: str, skin_type: str, concerns: list, allergies: list) -> list:
    """period: 'morning' or 'evening'. Returns ordered list of step dicts."""
    step_names = MORNING_STEPS if period == "morning" else EVENING_STEPS
    routine = []
    used_actives = set()
    used_names = set()

    for i, step in enumerate(step_names, start=1):
        ingredient = _pick_ingredient_for_step(step, skin_type, concerns, allergies, used_names, used_actives)

        reason = "General skin maintenance"
        if ingredient:
            matched_concerns = set(ingredient["concerns_treated"]) & set(concerns)
            if matched_concerns:
                reason = f"Targets: {', '.join(matched_concerns)}"
            else:
                reason = f"Suited to {skin_type} skin"
            used_actives.add(ingredient["name"])
            used_names.add(ingredient["name"])

        routine.append({
            "order": i,
            "step": step,
            "category": STEP_TO_CATEGORY[step],
            "reason": reason,
            "suggested_ingredient": ingredient["name"] if ingredient else None,
        })

    return routine


def generate_weekly_treatment(skin_type: str, concerns: list) -> list:
    """Once/twice-weekly extras: exfoliation, masks - kept separate from daily routine."""
    plan = []
    if "acne" in concerns or "oily_skin" in concerns:
        plan.append({"day": "Tue/Fri", "treatment": "Clarifying clay mask", "reason": "Controls oil, unclogs pores"})
    if "dull_skin" in concerns or "uneven_skin_tone" in concerns:
        plan.append({"day": "Wed", "treatment": "AHA exfoliation", "reason": "Brightens, smooths texture"})
    if "dry_skin" in concerns or skin_type == "dry":
        plan.append({"day": "Sun", "treatment": "Overnight hydrating mask", "reason": "Deep replenishment"})
    if not plan:
        plan.append({"day": "Sun", "treatment": "Gentle hydrating mask", "reason": "General maintenance"})
    return plan
