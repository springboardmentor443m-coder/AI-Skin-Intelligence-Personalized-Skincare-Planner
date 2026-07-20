"""
Scoring service: converts ML predictions + lifestyle inputs into a single
weighted 'Skin Health Score' (0-100) used across dashboards and reports.
"""
from typing import Dict, List, Optional


SEVERITY_PENALTY = {
    "mild": 5,
    "moderate": 12,
    "severe": 22,
}

# Relative weighting of lifestyle factors within the score (must sum to 1.0)
LIFESTYLE_WEIGHTS = {
    "hydration": 0.30,
    "sleep": 0.30,
    "sun_protection": 0.25,
    "stress": 0.15,
}


def _hydration_component(water_ml: Optional[float]) -> float:
    if water_ml is None:
        return 0.5  # neutral default when unknown
    target_ml = 2000.0
    return max(0.0, min(1.0, water_ml / target_ml))


def _sleep_component(sleep_hours: Optional[float]) -> float:
    if sleep_hours is None:
        return 0.5
    ideal = 8.0
    return max(0.0, min(1.0, 1 - abs(sleep_hours - ideal) / ideal))


def _sun_protection_component(sun_hours: Optional[float], uses_sunscreen: Optional[bool]) -> float:
    if uses_sunscreen is None and sun_hours is None:
        return 0.5
    base = 1.0 if uses_sunscreen else 0.3
    if sun_hours is not None and sun_hours > 4 and not uses_sunscreen:
        base *= 0.5
    return max(0.0, min(1.0, base))


def _stress_component(stress_level: Optional[int]) -> float:
    if stress_level is None:
        return 0.5
    # stress_level is 1 (low) - 10 (high); invert so lower stress -> higher score
    return max(0.0, min(1.0, 1 - (stress_level - 1) / 9))


def compute_lifestyle_score(lifestyle_inputs: Dict) -> float:
    """Returns a 0-100 lifestyle sub-score."""
    hydration = _hydration_component(lifestyle_inputs.get("avg_daily_water_intake_ml"))
    sleep = _sleep_component(lifestyle_inputs.get("avg_sleep_hours"))
    sun = _sun_protection_component(
        lifestyle_inputs.get("sun_exposure_hours_per_day"), lifestyle_inputs.get("uses_sunscreen_daily")
    )
    stress = _stress_component(lifestyle_inputs.get("stress_level"))

    weighted = (
        hydration * LIFESTYLE_WEIGHTS["hydration"]
        + sleep * LIFESTYLE_WEIGHTS["sleep"]
        + sun * LIFESTYLE_WEIGHTS["sun_protection"]
        + stress * LIFESTYLE_WEIGHTS["stress"]
    )
    return weighted * 100


def compute_skin_health_score(predicted_concerns: List[Dict], lifestyle_inputs: Dict) -> float:
    """
    Blends the ML-predicted concern severities with the lifestyle sub-score
    to produce the final 0-100 Skin Health Score shown to users.

    predicted_concerns: list of dicts with keys {concern, confidence, severity}
    """
    base_score = 100.0
    for concern in predicted_concerns:
        severity = concern.get("severity", "mild")
        confidence = concern.get("confidence", 0.5)
        penalty = SEVERITY_PENALTY.get(severity, 5) * confidence
        base_score -= penalty

    base_score = max(0.0, base_score)
    lifestyle_score = compute_lifestyle_score(lifestyle_inputs)

    # Final score weights clinical/ML findings more heavily than lifestyle,
    # since lifestyle is a contributing-but-secondary factor to skin condition.
    final_score = (base_score * 0.7) + (lifestyle_score * 0.3)
    return round(max(0.0, min(100.0, final_score)), 1)
