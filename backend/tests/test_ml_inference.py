"""
Tests for the ML inference engine's heuristic fallback path (exercised
whenever no trained model artifact is present) and the scoring service.
"""
import pytest

from app.ml.pipelines.inference_engine import InferenceEngine
from app.services.scoring_service import compute_skin_health_score, compute_lifestyle_score


@pytest.fixture
def engine():
    return InferenceEngine()


def test_predict_returns_expected_shape(engine):
    profile = {
        "skin_type": "oily",
        "fitzpatrick_scale": 3,
        "primary_concerns": ["acne"],
        "known_allergies": [],
        "avg_daily_water_intake_ml": 1000,
        "avg_sleep_hours": 6,
        "sun_exposure_hours_per_day": 5,
        "uses_sunscreen_daily": False,
        "stress_level": 8,
    }
    result = engine.predict(profile)
    assert "predicted_concerns" in result
    assert "model_version" in result
    assert isinstance(result["predicted_concerns"], list)
    assert len(result["predicted_concerns"]) > 0
    for concern in result["predicted_concerns"]:
        assert set(concern.keys()) == {"concern", "confidence", "severity"}
        assert 0 <= concern["confidence"] <= 1
        assert concern["severity"] in {"mild", "moderate", "severe"}


def test_low_hydration_flags_dehydration(engine):
    profile = {
        "skin_type": "dry",
        "primary_concerns": [],
        "avg_daily_water_intake_ml": 500,
        "avg_sleep_hours": 7,
        "sun_exposure_hours_per_day": 1,
        "uses_sunscreen_daily": True,
        "stress_level": 3,
    }
    result = engine.predict(profile)
    concern_names = {c["concern"] for c in result["predicted_concerns"]}
    assert "dehydration" in concern_names


def test_predict_handles_invalid_image_gracefully(engine):
    profile = {"skin_type": "normal", "primary_concerns": [], "stress_level": 4}
    result = engine.predict(profile, image_base64="not-valid-base64!!!")
    assert "predicted_concerns" in result


def test_lifestyle_score_rewards_healthy_habits():
    healthy = compute_lifestyle_score(
        {
            "avg_daily_water_intake_ml": 2000,
            "avg_sleep_hours": 8,
            "sun_exposure_hours_per_day": 1,
            "uses_sunscreen_daily": True,
            "stress_level": 2,
        }
    )
    unhealthy = compute_lifestyle_score(
        {
            "avg_daily_water_intake_ml": 400,
            "avg_sleep_hours": 4,
            "sun_exposure_hours_per_day": 6,
            "uses_sunscreen_daily": False,
            "stress_level": 9,
        }
    )
    assert healthy > unhealthy


def test_skin_health_score_penalizes_severe_concerns():
    mild_case = compute_skin_health_score(
        predicted_concerns=[{"concern": "dehydration", "confidence": 0.5, "severity": "mild"}],
        lifestyle_inputs={"avg_daily_water_intake_ml": 2000, "avg_sleep_hours": 8, "stress_level": 2},
    )
    severe_case = compute_skin_health_score(
        predicted_concerns=[{"concern": "acne", "confidence": 0.9, "severity": "severe"}],
        lifestyle_inputs={"avg_daily_water_intake_ml": 2000, "avg_sleep_hours": 8, "stress_level": 2},
    )
    assert mild_case > severe_case
    assert 0 <= severe_case <= 100
    assert 0 <= mild_case <= 100
