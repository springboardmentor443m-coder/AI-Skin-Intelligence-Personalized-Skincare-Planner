import os
import logging
import numpy as np

logger = logging.getLogger("uvicorn.error")

# Path to the trained TensorFlow model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "skin_disease_model.keras")

# Class names for the trained model
CLASS_NAMES = [
    "Normal",
    "Acne",
    "Wrinkles",
    "Eczema",
    "Rosacea",
    "Dark Spots",
]

# Configurable OOD and Confidence Thresholds
MIN_CONFIDENCE_THRESHOLD = 0.45  # Minimum 45% top-1 probability
MIN_MARGIN_THRESHOLD = 0.10      # Minimum 10% difference between top-1 and top-2

_model = None


def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            logger.error(f"TensorFlow model file missing at path: {MODEL_PATH}")
            raise FileNotFoundError(f"Skin disease model file missing: {MODEL_PATH}")

        logger.info(f"Loading TensorFlow model from: {MODEL_PATH} (size: {os.path.getsize(MODEL_PATH)} bytes)...")
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("TensorFlow model loaded successfully.")

    return _model


def predict_image(image_path: str):
    """
    Predict the disease class for an image located at image_path with OOD rejection.
    Inspects full softmax probability distribution and enforces minimum confidence & margin thresholds.
    """
    import time
    from PIL import Image

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Input image not found: {image_path}")

    try:
        t0 = time.perf_counter()
        model = get_model()
        t_model = (time.perf_counter() - t0) * 1000

        t_prep_start = time.perf_counter()
        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))
        image_array = np.array(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)
        image_array = image_array / 255.0
        t_prep = (time.perf_counter() - t_prep_start) * 1000

        t_infer_start = time.perf_counter()
        predictions = model.predict(image_array, verbose=0)[0]
        t_infer = (time.perf_counter() - t_infer_start) * 1000

        sorted_indices = np.argsort(predictions)[::-1]

        top1_idx = int(sorted_indices[0])
        top2_idx = int(sorted_indices[1])

        top1_prob = float(predictions[top1_idx])
        top2_prob = float(predictions[top2_idx])
        margin = top1_prob - top2_prob

        all_probs = {CLASS_NAMES[i]: round(float(predictions[i]), 4) for i in range(len(CLASS_NAMES))}

        # OOD & Low Confidence Check
        is_confident = (top1_prob >= MIN_CONFIDENCE_THRESHOLD) and (margin >= MIN_MARGIN_THRESHOLD)

        if is_confident:
            predicted_disease = CLASS_NAMES[top1_idx]
            message = "Prediction successful."
        else:
            predicted_disease = None
            message = "Unable to confidently identify a skin condition."

        logger.info(
            f"Prediction analysis for {os.path.basename(image_path)}:\n"
            f"  Top 1: {CLASS_NAMES[top1_idx]} ({top1_prob * 100:.2f}%)\n"
            f"  Top 2: {CLASS_NAMES[top2_idx]} ({top2_prob * 100:.2f}%)\n"
            f"  Margin: {margin * 100:.2f}%\n"
            f"  All class probabilities: {all_probs}\n"
            f"  Is Confident: {is_confident}"
        )

        return {
            "valid_image": True,
            "disease": predicted_disease,
            "confidence": round(top1_prob, 4),
            "confidence_percentage": f"{top1_prob * 100:.2f}%",
            "is_confident": is_confident,
            "is_ambiguous": not is_confident,
            "margin": round(margin, 4),
            "message": message,
            "all_probabilities": all_probs,
            "timing_ms": {
                "model_check": round(t_model, 2),
                "preprocessing": round(t_prep, 2),
                "inference": round(t_infer, 2),
            },
        }
    except Exception as exc:
        logger.error(f"Error executing predict_image on {image_path}: {exc}", exc_info=True)
        raise
