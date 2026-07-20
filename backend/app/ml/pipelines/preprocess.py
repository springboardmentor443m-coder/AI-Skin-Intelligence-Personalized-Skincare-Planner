"""
Preprocessing utilities shared by training and inference:
- Tabular feature engineering from skin-profile fields
- Basic image cleaning/normalization for the CV classifier
"""
import base64
import io
from typing import Dict, List, Optional

import numpy as np

CATEGORICAL_SKIN_TYPES = ["oily", "dry", "combination", "normal", "sensitive"]

TABULAR_FEATURE_ORDER = [
    "fitzpatrick_scale",
    "avg_daily_water_intake_ml",
    "avg_sleep_hours",
    "sun_exposure_hours_per_day",
    "uses_sunscreen_daily",
    "stress_level",
    "skin_type_oily",
    "skin_type_dry",
    "skin_type_combination",
    "skin_type_normal",
    "skin_type_sensitive",
]


def one_hot_skin_type(skin_type: Optional[str]) -> Dict[str, int]:
    encoding = {f"skin_type_{t}": 0 for t in CATEGORICAL_SKIN_TYPES}
    if skin_type and skin_type in CATEGORICAL_SKIN_TYPES:
        encoding[f"skin_type_{skin_type}"] = 1
    return encoding


def build_feature_vector(skin_profile: Dict) -> np.ndarray:
    """
    Converts a raw skin-profile dict into an ordered numeric feature vector
    matching TABULAR_FEATURE_ORDER, ready for the scaler + model.
    Missing numeric values are imputed with 0 (the scaler/model should be
    trained with the same imputation strategy).
    """
    one_hot = one_hot_skin_type(skin_profile.get("skin_type"))

    row = {
        "fitzpatrick_scale": skin_profile.get("fitzpatrick_scale") or 0,
        "avg_daily_water_intake_ml": skin_profile.get("avg_daily_water_intake_ml") or 0,
        "avg_sleep_hours": skin_profile.get("avg_sleep_hours") or 0,
        "sun_exposure_hours_per_day": skin_profile.get("sun_exposure_hours_per_day") or 0,
        "uses_sunscreen_daily": int(bool(skin_profile.get("uses_sunscreen_daily"))),
        "stress_level": skin_profile.get("stress_level") or 0,
        **one_hot,
    }

    return np.array([row[feature] for feature in TABULAR_FEATURE_ORDER], dtype=float)


def decode_image_base64(image_base64: str) -> "np.ndarray":
    """
    Decodes a base64 image string into a normalized RGB numpy array
    suitable for the CV classifier. Requires Pillow at runtime.
    """
    from PIL import Image

    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    array = np.asarray(image, dtype=np.float32) / 255.0
    return array


def load_known_allergen_list(known_allergies: Optional[List[str]]) -> List[str]:
    return [a.strip().lower() for a in (known_allergies or []) if a and a.strip()]
