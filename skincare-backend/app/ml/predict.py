"""
Loads both trained models once at server startup, and provides functions
to run predictions on uploaded images:
  1. Skin CONCERN model (7 classes: acne types, wrinkles, pores, etc.) - 90% accuracy
  2. Skin TYPE model (5 classes: combination/dry/normal/oily/sensitive) - 97.78% accuracy
"""

import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import io
import cv2
import numpy as np
from PIL import Image

_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_CONCERN_MODEL_PATH = os.path.join(_MODEL_DIR, "skin_concern_model.keras")
_CONCERN_CLASSES_PATH = os.path.join(_MODEL_DIR, "skin_concern_classes.txt")
_TYPE_MODEL_PATH = os.path.join(_MODEL_DIR, "skin_type_model_v3.keras")
_TYPE_CLASSES_PATH = os.path.join(_MODEL_DIR, "skin_type_classes_v3.txt")

IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.50

# Loaded lazily / in background thread — NOT reloaded per-request
tf = None
_concern_model = None
_concern_classes = None
_type_model = None
_type_classes = None


def load_model():
    """Loads BOTH models lazily or in background thread."""
    global _concern_model, _concern_classes, _type_model, _type_classes, tf
    if tf is None:
        import tensorflow as _tf
        tf = _tf
    if _concern_model is None:
        _concern_model = tf.keras.models.load_model(_CONCERN_MODEL_PATH)
        with open(_CONCERN_CLASSES_PATH) as f:
            _concern_classes = [line.strip() for line in f if line.strip()]
    if _type_model is None:
        _type_model = tf.keras.models.load_model(_TYPE_MODEL_PATH)
        with open(_TYPE_CLASSES_PATH) as f:
            _type_classes = [line.strip() for line in f if line.strip()]
    return _concern_model, _concern_classes


_face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
_profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')


def _is_digital_illustration(img_np: np.ndarray) -> bool:
    """
    Detects flat digital vector illustrations / drawings which have posterized
    flat color fills and lack natural photographic noise/skin micro-texture.
    """
    # Convert to HSV and check color histogram quantization
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    # Calculate Saturation channel variance
    s_std = np.std(hsv[:, :, 1])
    # Vector art often has very low laplacian variance (super smooth flat regions with crisp line edges)
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Flat digital art typically has low saturation variance combined with specific laplacian range
    # Or posterized unique color count in downscaled version
    small = cv2.resize(img_np, (64, 64))
    unique_colors = len(np.unique(small.reshape(-1, 3), axis=0))

    return unique_colors < 350 or (s_std < 15.0 and laplacian_var < 50.0)


def _is_real_human_face(faces, img_np: np.ndarray, small_w: int, small_h: int) -> bool:
    """
    Validates detected Haar cascade bounding boxes to discard false positives
    on tiny printed logos, cards, objects, or flower petals.
    """
    if len(faces) == 0:
        return False

    total_area = small_w * small_h
    img_small = cv2.resize(img_np, (small_w, small_h))

    ycrcb = cv2.cvtColor(img_small, cv2.COLOR_RGB2YCrCb)
    ycrcb_mask = cv2.inRange(ycrcb, np.array([60, 135, 85], dtype=np.uint8), np.array([240, 170, 130], dtype=np.uint8))
    hsv = cv2.cvtColor(img_small, cv2.COLOR_RGB2HSV)
    hsv_mask1 = cv2.inRange(hsv, np.array([0, 45, 60], dtype=np.uint8), np.array([25, 160, 255], dtype=np.uint8))
    hsv_mask2 = cv2.inRange(hsv, np.array([165, 45, 60], dtype=np.uint8), np.array([180, 160, 255], dtype=np.uint8))
    hsv_mask = cv2.bitwise_or(hsv_mask1, hsv_mask2)
    skin_mask = cv2.bitwise_and(ycrcb_mask, hsv_mask)

    for (x, y, fw, fh) in faces:
        face_area = fw * fh
        area_ratio = face_area / total_area

        # 1. Face box must be at least 2.5% of total image (filters out tiny card logos/drawings)
        if area_ratio < 0.025:
            continue

        # 2. Inside the face box, at least 35% of pixels must be skin-toned
        face_skin_crop = skin_mask[y : y + fh, x : x + fw]
        if face_skin_crop.size == 0:
            continue
        skin_in_face = np.count_nonzero(face_skin_crop) / face_skin_crop.size

        if skin_in_face >= 0.35:
            return True

    return False


def _detect_face_or_skin(pil_image: Image.Image) -> tuple[bool, bool]:
    """
    Evaluates whether the image is:
    1. A human face (via Haar Cascade detectors with face box verification)
    2. Or a close-up macro skin photo (via color/texture validation)

    Returns (is_face_found, is_skin_patch_valid).
    """
    img_np = np.array(pil_image.convert("RGB"))
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

    # 1. Check OpenCV Face Cascade Detection with strict size & skin box validation
    h, w = img_np.shape[:2]
    scale = 600.0 / max(h, w) if max(h, w) > 600 else 1.0
    small_w, small_h = int(w * scale), int(h * scale)
    small_gray = cv2.resize(gray, (small_w, small_h)) if scale != 1.0 else gray

    frontal_faces = _face_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=4, minSize=(35, 35))
    if _is_real_human_face(frontal_faces, img_np, small_w, small_h):
        return True, True

    profile_faces = _profile_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=4, minSize=(35, 35))
    if _is_real_human_face(profile_faces, img_np, small_w, small_h):
        return True, True

    # 2. Reject digital vector illustrations / graphic art
    if _is_digital_illustration(img_np):
        return False, False

    # 3. Macro skin patch validation (for close-up cheek/forehead photos without full face features)
    ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
    # Human skin Cr channel is strictly 135-170, Cb is 85-130
    ycrcb_mask = cv2.inRange(ycrcb, np.array([60, 135, 85], dtype=np.uint8), np.array([240, 170, 130], dtype=np.uint8))

    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    # Human skin saturation is 45 to 160 (filters out white paper cards, gray backgrounds, light wood)
    hsv_mask1 = cv2.inRange(hsv, np.array([0, 45, 60], dtype=np.uint8), np.array([25, 160, 255], dtype=np.uint8))
    hsv_mask2 = cv2.inRange(hsv, np.array([165, 45, 60], dtype=np.uint8), np.array([180, 160, 255], dtype=np.uint8))
    hsv_mask = cv2.bitwise_or(hsv_mask1, hsv_mask2)

    combined_mask = cv2.bitwise_and(ycrcb_mask, hsv_mask)
    total_pixels = combined_mask.size
    skin_ratio = np.count_nonzero(combined_mask) / total_pixels

    # Non-skin background pixels (tables, purple chocolate, blue cards, white paper)
    non_skin_mask = cv2.bitwise_not(combined_mask)
    non_skin_ratio = np.count_nonzero(non_skin_mask) / total_pixels

    # Texture / Edge density check
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.count_nonzero(edges) / total_pixels

    # Genuine close-up skin photo requires >= 75% true skin coverage and <= 25% non-skin background
    is_skin_patch = (skin_ratio >= 0.75) and (non_skin_ratio <= 0.25) and (edge_density <= 0.15)
    return False, is_skin_patch


def _run_model(model, class_names, img_array):
    """Runs one model on a preprocessed image array, returns scores dict + top pick."""
    predictions = model.predict(img_array, verbose=0)[0]
    all_scores = {class_names[i]: float(predictions[i]) for i in range(len(class_names))}
    top_idx = int(np.argmax(predictions))
    top_confidence = float(predictions[top_idx])
    is_confident = top_confidence >= CONFIDENCE_THRESHOLD
    return {
        "top_label": class_names[top_idx] if is_confident else "Inconclusive",
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

    is_face_found, is_skin_patch = _detect_face_or_skin(img)

    if not is_face_found and not is_skin_patch:
        return {
            "face_detected": False,
            "concern": None,
            "skin_type": None,
        }

    img_resized = img.resize(IMG_SIZE)
    img_array = np.array(img_resized, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    concern_result = _run_model(_concern_model, _concern_classes, img_array)
    type_result = _run_model(_type_model, _type_classes, img_array)

    # Secondary safeguard: If no human face was detected by cascades, and model confidence is below threshold,
    # reject as non-face/non-skin photo.
    if not is_face_found and (concern_result["confidence"] < CONFIDENCE_THRESHOLD or type_result["confidence"] < CONFIDENCE_THRESHOLD):
        return {
            "face_detected": False,
            "concern": None,
            "skin_type": None,
        }

    return {
        "face_detected": True,
        "concern": concern_result,
        "skin_type": type_result,
    }