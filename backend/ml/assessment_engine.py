"""
Skin Assessment Engine.
Combines the predicted/declared skin type with self-reported concerns to
produce a condition score (0-100, 100=best) and prioritized risk flags.
"""

CONCERN_SEVERITY = {
    "acne": 15,
    "hyperpigmentation": 10,
    "dark_spots": 8,
    "wrinkles": 10,
    "fine_lines": 6,
    "redness": 8,
    "uneven_skin_tone": 6,
    "enlarged_pores": 5,
    "dry_skin": 7,
    "oily_skin": 6,
    "sensitive_skin": 7,
    "dull_skin": 5,
    "sun_damage": 12,
}

HIGH_PRIORITY_CONCERNS = {"acne", "wrinkles", "sun_damage", "hyperpigmentation"}


def assess(concerns: list, skin_type: str, allergies: list) -> dict:
    """
    Returns condition_score (0-100), prioritized concern list, and risk flags.
    """
    penalty = sum(CONCERN_SEVERITY.get(c, 4) for c in concerns)
    condition_score = max(5.0, round(100 - penalty, 1))

    prioritized = sorted(
        concerns,
        key=lambda c: (c not in HIGH_PRIORITY_CONCERNS, -CONCERN_SEVERITY.get(c, 4)),
    )

    risk_flags = []
    if "sun_damage" in concerns or "hyperpigmentation" in concerns:
        risk_flags.append("Recommend daily broad-spectrum SPF and consider a dermatologist consult")
    if "acne" in concerns and skin_type == "oily":
        risk_flags.append("Oily + acne-prone: watch for pore-clogging (comedogenic) ingredients")
    if skin_type == "sensitive" and len(allergies) > 0:
        risk_flags.append("Sensitive skin with known allergies: patch-test all new products")
    if len(concerns) >= 4:
        risk_flags.append("Multiple concerns detected - consider a phased routine rather than all at once")

    return {
        "condition_score": condition_score,
        "prioritized_concerns": prioritized,
        "risk_flags": risk_flags,
    }
