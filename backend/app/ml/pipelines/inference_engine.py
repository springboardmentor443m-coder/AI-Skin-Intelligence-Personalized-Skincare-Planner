"""
Inference adapter: loads the trained classifier (+ scaler) once per process
and exposes a simple `.predict()` API consumed by the assessment endpoint.

Falls back to a deterministic heuristic when no trained artifact is present
yet (e.g. fresh environment before the first training run), so the API
remains functional end-to-end during development.
"""
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

from app.core.config import settings
from app.ml.pipelines.preprocess import build_feature_vector, decode_image_base64

logger = logging.getLogger(__name__)

CONCERN_LABELS = ["acne", "hyperpigmentation", "wrinkles", "dehydration", "redness", "large_pores"]


class InferenceEngine:
    def __init__(self) -> None:
        self.model = None
        self.scaler = None
        self.model_version = "heuristic-fallback-0.0.0"
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        model_path = Path(settings.SKIN_CLASSIFIER_PATH) / "concern_classifier.pkl"
        scaler_path = Path(settings.SCALER_PATH)
        metadata_path = Path(settings.SKIN_CLASSIFIER_PATH) / "metadata.json"

        try:
            import joblib

            if model_path.exists() and scaler_path.exists():
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                if metadata_path.exists():
                    with open(metadata_path, "r") as f:
                        meta = json.load(f)
                        self.model_version = meta.get("model_version", "1.0.0")
                logger.info("Loaded trained classifier, version=%s", self.model_version)
            else:
                logger.warning("No trained model artifacts found at %s; using heuristic fallback", model_path)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to load ML artifacts, falling back to heuristic: %s", exc)
            self.model = None
            self.scaler = None

    def _heuristic_predict(self, skin_profile: Dict) -> List[Dict]:
        """
        Rules-of-thumb fallback so the API works before a model is trained.
        Not intended for production-grade accuracy.
        """
        concerns = []
        primary_concerns = skin_profile.get("primary_concerns") or []
        stress_level = skin_profile.get("stress_level") or 5
        sun_hours = skin_profile.get("sun_exposure_hours_per_day") or 0
        uses_sunscreen = skin_profile.get("uses_sunscreen_daily")
        water_ml = skin_profile.get("avg_daily_water_intake_ml") or 1500

        if "acne" in primary_concerns or stress_level >= 7:
            concerns.append({"concern": "acne", "confidence": 0.6, "severity": "moderate"})
        if sun_hours > 3 and not uses_sunscreen:
            concerns.append({"concern": "hyperpigmentation", "confidence": 0.55, "severity": "mild"})
        if water_ml < 1200:
            concerns.append({"concern": "dehydration", "confidence": 0.65, "severity": "moderate"})
        if not concerns:
            concerns.append({"concern": "dehydration", "confidence": 0.3, "severity": "mild"})

        return concerns

    def predict(self, skin_profile: Dict, image_base64: Optional[str] = None) -> Dict:
        if image_base64:
            try:
                # Decoded but not yet fed into a CV model here; reserved for the
                # image-augmented path once train_classifier's CNN branch is wired in.
                decode_image_base64(image_base64)
            except Exception:  # noqa: BLE001
                logger.warning("Failed to decode provided image; continuing with tabular-only prediction")

        if self.model is not None and self.scaler is not None:
            feature_vector = build_feature_vector(skin_profile).reshape(1, -1)
            scaled = self.scaler.transform(feature_vector)
            probabilities = self.model.predict_proba(scaled)

            predicted_concerns = []
            for label, proba in zip(CONCERN_LABELS, probabilities):
                confidence = float(proba[0][1]) if proba.shape[1] > 1 else float(proba[0][0])
                if confidence >= 0.4:
                    severity = "severe" if confidence > 0.75 else "moderate" if confidence > 0.55 else "mild"
                    predicted_concerns.append({"concern": label, "confidence": round(confidence, 2), "severity": severity})

            feature_importance = None
            try:
                importances = np.mean(
                    [est.feature_importances_ for est in self.model.estimators_], axis=0
                )
                from app.ml.pipelines.preprocess import TABULAR_FEATURE_ORDER

                feature_importance = {
                    feat: round(float(imp), 4) for feat, imp in zip(TABULAR_FEATURE_ORDER, importances)
                }
            except Exception:  # noqa: BLE001
                pass

            return {
                "predicted_concerns": predicted_concerns or self._heuristic_predict(skin_profile),
                "feature_importance": feature_importance,
                "model_version": self.model_version,
            }

        return {
            "predicted_concerns": self._heuristic_predict(skin_profile),
            "feature_importance": None,
            "model_version": self.model_version,
        }
