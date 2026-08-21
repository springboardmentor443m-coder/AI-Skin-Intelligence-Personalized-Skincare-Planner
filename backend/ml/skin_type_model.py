"""
Skin type predictor - wired to the trained MobileNetV2-based classifier
(final_skin_classifier.keras).

Model facts (confirmed by inspecting the uploaded file):
  - Single input: RGB image, 224x224x3
  - Output: Dense(5, softmax) -> 5 skin-type classes
  - Backbone: MobileNetV2 (transfer learning, partially frozen)
  - No tabular/profile input - image only

ASSUMPTION FLAGGED FOR YOU TO CONFIRM:
  The class label order below is a best guess (alphabetical - Keras's
  `flow_from_directory` default when class folders aren't given an
  explicit order). If your training folders were named/ordered
  differently, fix CLASS_LABELS below and everything downstream
  (routine/product logic) will automatically use the corrected order.
"""
import os
import io
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "skin_type_model.keras")

# TODO CONFIRM: order must match the training generator's class_indices.
# Default assumption = alphabetical (Keras default when using flow_from_directory
# without an explicit `classes=[...]` argument).
CLASS_LABELS = ["combination", "dry", "normal", "oily", "sensitive"]

IMAGE_SIZE = (224, 224)

_model = None
_model_load_attempted = False


def _try_load_model():
    global _model, _model_load_attempted
    if _model_load_attempted:
        return
    _model_load_attempted = True
    if not os.path.exists(MODEL_PATH):
        print(f"[ml] No model found at {MODEL_PATH} - using rule-based fallback.")
        return
    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[ml] Loaded trained skin-type model from {MODEL_PATH}")
    except Exception as e:
        print(f"[ml] Found {MODEL_PATH} but failed to load it: {e}")
        _model = None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Turns raw uploaded image bytes into the (224,224,3) array the model
    expects. Uses MobileNetV2's standard preprocessing (scale to [-1,1])
    since the model itself has no Rescaling/Normalization layer baked in
    - TODO CONFIRM: if your training pipeline used a different
    preprocessing (e.g. plain /255.0), swap the line marked below.
    """
    from PIL import Image
    import tensorflow as tf

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMAGE_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)  # -> TODO CONFIRM
    return arr


def _rule_based_predict(profile: dict) -> tuple:
    """Fallback used only when no image is provided or the model can't load."""
    water = profile.get("water_intake_liters", 2.0)
    sleep = profile.get("sleep_hours", 7.0)
    exposure = profile.get("environmental_exposure", "moderate")
    lifestyle = profile.get("lifestyle_habits", [])

    dryness_signal = (2.5 - water) + (7.0 - sleep) * 0.3
    oiliness_signal = (-2.5 + water) * 0.2
    if "high_stress" in lifestyle or "smoking" in lifestyle:
        oiliness_signal += 1.0
    if exposure == "high":
        dryness_signal += 0.5

    if dryness_signal > 1.5:
        return "dry", 0.55
    if oiliness_signal > 1.0:
        return "oily", 0.55
    if dryness_signal > 0.3 and oiliness_signal > 0.3:
        return "combination", 0.5
    return "normal", 0.5


def predict(profile: dict, image_bytes: bytes = None) -> dict:
    """
    profile: dict with keys age_group, sleep_hours, water_intake_liters,
             environmental_exposure, lifestyle_habits (used only by the
             rule-based fallback).
    image_bytes: raw bytes of an uploaded face/skin photo. If provided AND
             the trained model loaded successfully, this drives the
             prediction. Otherwise falls back to the rule-based estimate.

    Returns: {"skin_type": str, "confidence": float, "source": "model"|"rule_based",
              "all_probabilities": {label: prob, ...} | None}
    """
    _try_load_model()

    if _model is not None and image_bytes is not None:
        try:
            img_array = preprocess_image(image_bytes)
            img_batch = np.expand_dims(img_array, axis=0)
            preds = _model.predict(img_batch, verbose=0)[0]
            idx = int(np.argmax(preds))
            confidence = float(preds[idx])
            label = CLASS_LABELS[idx] if idx < len(CLASS_LABELS) else "normal"
            return {
                "skin_type": label,
                "confidence": round(confidence, 3),
                "source": "model",
                "all_probabilities": {CLASS_LABELS[i]: round(float(p), 3) for i, p in enumerate(preds)},
            }
        except Exception as e:
            print(f"[ml] Model inference failed, falling back to rule-based: {e}")

    label, confidence = _rule_based_predict(profile)
    return {"skin_type": label, "confidence": confidence, "source": "rule_based", "all_probabilities": None}
