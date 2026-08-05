"""
Loads both trained models once at server startup, and provides functions
to run predictions on uploaded images:
  1. Skin CONCERN model (7 classes: acne types, wrinkles, pores, etc.) - 90% accuracy
  2. Skin TYPE model (5 classes: combination/dry/normal/oily/sensitive) - 97.78% accuracy
"""

import os
import io

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_CONCERN_MODEL_PATH = os.path.join(_MODEL_DIR, "skin_concern_model.keras")
_CONCERN_CLASSES_PATH = os.path.join(_MODEL_DIR, "skin_concern_classes.txt")
_TYPE_MODEL_PATH = os.path.join(_MODEL_DIR, "skin_type_model_v3.keras")
_TYPE_CLASSES_PATH = os.path.join(_MODEL_DIR, "skin_type_classes_v3.txt")

IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.40

# Loaded once when the server starts — NOT reloaded per-request (too slow)
_concern_model = None
_concern_classes = None
_type_model = None
_type_classes = None


def load_model():
    """Called once at server startup (see main.py). Loads BOTH models."""
    global _concern_model, _concern_classes, _type_model, _type_classes
    if _concern_model is None:
        _concern_model = tf.keras.models.load_model(_CONCERN_MODEL_PATH)
        with open(_CONCERN_CLASSES_PATH) as f:
            _concern_classes = [line.strip() for line in f if line.strip()]
    if _type_model is None:
        _type_model = tf.keras.models.load_model(_TYPE_MODEL_PATH)
        with open(_TYPE_CLASSES_PATH) as f:
            _type_classes = [line.strip() for line in f if line.strip()]
    return _concern_model, _concern_classes


def _looks_like_skin(pil_image: Image.Image) -> bool:
    """
    Checks whether the photo contains a meaningful amount of skin-toned
    pixels. Used instead of a strict "full face" detector, since these
    models are trained on CLOSE-UP skin patches, not necessarily a
    complete face with eyes/nose visible.
    """
    img_array = np.array(pil_image.convert("RGB"))
    ycrcb = cv2.cvtColor(img_array, cv2.COLOR_RGB2YCrCb)
    lower = np.array([0, 135, 85], dtype=np.uint8)
    upper = np.array([255, 180, 135], dtype=np.uint8)
    skin_mask = cv2.inRange(ycrcb, lower, upper)
    skin_ratio = np.count_nonzero(skin_mask) / skin_mask.size
    return skin_ratio > 0.15


def _run_model(model, class_names, img_array):
    """Runs one model on a preprocessed image array, returns scores dict + top pick."""
    predictions = model.predict(img_array, verbose=0)[0]
    all_scores = {class_names[i]: float(predictions[i]) for i in range(len(class_names))}
    top_idx = int(np.argmax(predictions))
    top_confidence = float(predictions[top_idx])
    is_confident = top_confidence >= CONFIDENCE_THRESHOLD
    return {
        "top_label": class_names[top_idx] if is_confident else "no strong result",
        "confidence": top_confidence,
        "all_scores": all_scores,
        "is_confident": is_confident,
    }


def predict_skin_concern(image_bytes: bytes) -> dict:
    """
    Runs BOTH the concern model and the skin-type model on the same photo.
    Returns a combined result dict.
    """
    load_model()  # ensures both models are loaded

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    if not _looks_like_skin(img):
        return {
            "face_detected": False,
            "concern": None,
            "skin_type": None,
        }

    img_resized = img.resize(IMG_SIZE)
    img_array = np.array(img_resized, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    # NOTE: no manual preprocess_input call — both models have MobileNetV2's
    # preprocessing built into their first layers already (baked into the
    # saved model graph during training). Applying it again here would
    # double-preprocess the image and corrupt predictions.

    concern_result = _run_model(_concern_model, _concern_classes, img_array)
    type_result = _run_model(_type_model, _type_classes, img_array)

    return {
        "face_detected": True,
        "concern": concern_result,
        "skin_type": type_result,
    }