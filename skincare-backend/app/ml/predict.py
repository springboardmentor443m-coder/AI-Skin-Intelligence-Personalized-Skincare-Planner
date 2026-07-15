"""
Loads the trained skin-concern model once at server startup, and provides
a function to run predictions on uploaded images.
"""

import os
import io

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_MODEL_DIR, "skin_concern_model.keras")
_CLASSES_PATH = os.path.join(_MODEL_DIR, "skin_concern_classes.txt")

IMG_SIZE = (224, 224)

# Loaded once when the server starts — NOT reloaded per-request (too slow)
_model = None
_class_names = None


def load_model():
    """Called once at server startup (see main.py)."""
    global _model, _class_names
    if _model is None:
        _model = tf.keras.models.load_model(_MODEL_PATH)
        with open(_CLASSES_PATH) as f:
            _class_names = [line.strip() for line in f if line.strip()]
    return _model, _class_names


def _looks_like_skin(pil_image: Image.Image) -> bool:
    """
    Checks whether the photo contains a meaningful amount of skin-toned
    pixels. Used instead of a strict "full face" detector, since this
    model is trained on CLOSE-UP skin patches (cheek, forehead, etc.),
    not necessarily a complete face with eyes/nose visible.
    """
    img_array = np.array(pil_image.convert("RGB"))
    ycrcb = cv2.cvtColor(img_array, cv2.COLOR_RGB2YCrCb)

    # Standard skin-tone range in YCrCb color space (works across skin tones)
    lower = np.array([0, 135, 85], dtype=np.uint8)
    upper = np.array([255, 180, 135], dtype=np.uint8)
    skin_mask = cv2.inRange(ycrcb, lower, upper)

    skin_ratio = np.count_nonzero(skin_mask) / skin_mask.size
    return skin_ratio > 0.15  # at least 15% of the image should look like skin


def predict_skin_concern(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes (from an uploaded file), returns:
    {
        "top_concern": "inflammatory acne",
        "confidence": 0.87,
        "all_scores": {"inflammatory acne": 0.87, "dark spots": 0.05, ...}
    }
    """
    model, class_names = load_model()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Step 1: does this photo contain skin at all? If not, don't bother
    # running the skin-concern model — it would just force a guess among
    # its 8 known conditions regardless of what's actually shown.
    if not _looks_like_skin(img):
        return {
            "top_concern": "no skin detected",
            "confidence": 0.0,
            "all_scores": {},
            "is_confident": False,
            "face_detected": False,
        }

    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # add batch dimension

    # NOTE: no manual preprocess_input call here — the trained model already
    # has MobileNetV2's preprocessing built into its first layers (it was
    # included in the training script's model graph). Applying it again here
    # would double-preprocess the image, corrupting the pixel values.

    predictions = model.predict(img_array, verbose=0)[0]  # shape: (8,)

    all_scores = {
        class_names[i]: float(predictions[i]) for i in range(len(class_names))
    }
    top_idx = int(np.argmax(predictions))
    top_confidence = float(predictions[top_idx])

    # Guardrail: the model always picks one of its 8 known conditions, even
    # for a photo showing mostly clear skin (or even a non-face photo). If
    # confidence is too low, it's more honest to say "no strong concern
    # detected" than to confidently report a guess that likely isn't right.
    CONFIDENCE_THRESHOLD = 0.40
    if top_confidence < CONFIDENCE_THRESHOLD:
        return {
            "top_concern": "no strong concern detected",
            "confidence": top_confidence,
            "all_scores": all_scores,
            "is_confident": False,
            "face_detected": True,
        }

    return {
        "top_concern": class_names[top_idx],
        "confidence": top_confidence,
        "all_scores": all_scores,
        "is_confident": True,
        "face_detected": True,
    }