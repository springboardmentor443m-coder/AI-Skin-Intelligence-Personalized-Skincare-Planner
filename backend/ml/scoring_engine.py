"""
Skin Health Scoring Engine.

Implements the spec's weighted formula exactly:
  Skin Health Score = Condition(35%) + Lifestyle(20%) + Sleep(15%)
                       + Routine Consistency(20%) + Hydration(10%)

Every sub-score is normalized to 0-100 before weighting.
"""

WEIGHTS = {
    "condition": 0.35,
    "lifestyle": 0.20,
    "sleep": 0.15,
    "routine": 0.20,
    "hydration": 0.10,
}

NEGATIVE_HABITS = {"smoking", "high_stress", "poor_diet", "alcohol", "no_sunscreen"}
POSITIVE_HABITS = {"exercise", "balanced_diet", "low_stress", "non_smoker", "daily_sunscreen"}


def lifestyle_score(lifestyle_habits: list) -> float:
    """100 = healthiest. Each negative habit subtracts, each positive habit adds."""
    score = 70.0  # neutral baseline
    for habit in lifestyle_habits:
        if habit in NEGATIVE_HABITS:
            score -= 12
        elif habit in POSITIVE_HABITS:
            score += 10
    return max(0.0, min(100.0, score))


def sleep_score(sleep_hours: float, sleep_quality_rating: int) -> float:
    """Blends hours-slept (ideal 7-9h) with the user's 1-10 self-rated quality."""
    if sleep_hours >= 7 and sleep_hours <= 9:
        hours_component = 100
    elif sleep_hours < 7:
        hours_component = max(0, 100 - (7 - sleep_hours) * 20)
    else:
        hours_component = max(0, 100 - (sleep_hours - 9) * 15)

    quality_component = max(0, min(100, sleep_quality_rating * 10))
    return round((hours_component * 0.5) + (quality_component * 0.5), 1)


def hydration_score(water_intake_liters: float) -> float:
    """Ideal ~2.5-3L/day."""
    if 2.5 <= water_intake_liters <= 3.5:
        return 100.0
    if water_intake_liters < 2.5:
        return max(0.0, round(water_intake_liters / 2.5 * 100, 1))
    return max(0.0, round(100 - (water_intake_liters - 3.5) * 10, 1))


def routine_consistency_score(days_logged: int, days_expected: int) -> float:
    """Percentage of expected AM+PM routine check-ins actually completed, last N days."""
    if days_expected == 0:
        return 50.0  # no data yet - neutral score
    return round(min(100.0, (days_logged / days_expected) * 100), 1)


def compute_overall_score(condition: float, lifestyle: float, sleep: float,
                           routine: float, hydration: float) -> dict:
    overall = (
        condition * WEIGHTS["condition"]
        + lifestyle * WEIGHTS["lifestyle"]
        + sleep * WEIGHTS["sleep"]
        + routine * WEIGHTS["routine"]
        + hydration * WEIGHTS["hydration"]
    )
    return {
        "condition_score": round(condition, 1),
        "lifestyle_score": round(lifestyle, 1),
        "sleep_score": round(sleep, 1),
        "routine_score": round(routine, 1),
        "hydration_score": round(hydration, 1),
        "overall_score": round(overall, 1),
    }
