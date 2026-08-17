"""
src/predict.py — Reusable Prediction Module
=============================================
Phase 7: ML Pipeline

What this module does:
  Provides a single reusable function `predict_image()` that:
    1. Accepts a file path or PIL Image
    2. Preprocesses it (resize, centre-crop, normalise)
    3. Runs it through the trained EfficientNetB0 model
    4. Returns the predicted class name, human-readable label,
       and confidence score

  This module is INDEPENDENT from FastAPI.
  It will be imported by the FastAPI prediction endpoint in Phase 8.

Usage (standalone test):
  python src/predict.py path/to/skin_image.jpg

Usage (import in other code):
  from src.predict import predict_image
  result = predict_image("path/to/image.jpg")
  print(result)
  # {
  #   "class":       "nv",
  #   "label":       "Melanocytic Nevi",
  #   "confidence":  0.9312,
  #   "all_scores":  {"akiec": 0.01, "bcc": 0.02, ...}
  # }

IMPORTANT DISCLAIMER:
  This model is for EDUCATIONAL PURPOSES ONLY.
  It is NOT a medical diagnostic tool.
  Do NOT use these predictions to make clinical decisions.
  Always consult a qualified dermatologist for skin concerns.
"""

import os
import sys
from typing import Union

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms

from src.config import (
    MODEL_PATH, CLASS_NAMES, CLASS_LABELS,
    IMAGE_SIZE, RESIZE_SIZE, IMAGENET_MEAN, IMAGENET_STD, NUM_CLASSES,
)
from src.model import build_model, get_device


# ── Preprocessing transform (same as val/test — no augmentation) ──────────────
_INFERENCE_TRANSFORM = transforms.Compose([
    transforms.Resize(RESIZE_SIZE),
    transforms.CenterCrop(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


# ── Model cache (load once, reuse on repeated calls) ─────────────────────────
#
# Loading the model from disk on every predict_image() call would add ~1s
# of overhead per request in production. We cache the loaded model in a
# module-level variable so it is only loaded once.
_cached_model: nn.Module = None
_cached_device: torch.device = None


def _get_model() -> tuple:
    """Load the model from disk if not already cached, then return (model, device)."""
    global _cached_model, _cached_device

    if _cached_model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"\nTrained model not found at:\n  {MODEL_PATH}\n\n"
                "Please train the model first:\n"
                "  1. Open ml/notebooks/01_training.ipynb in Google Colab\n"
                "  2. Run all cells\n"
                "  3. Download efficientnetb0_ham10000.pt to ml/models/\n"
            )

        device = get_device()
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)

        model = build_model(num_classes=NUM_CLASSES)
        model.load_state_dict(checkpoint["model_state_dict"])
        model = model.to(device)
        model.eval()

        _cached_model  = model
        _cached_device = device
        print(f"[predict] Model loaded from: {MODEL_PATH}")

    return _cached_model, _cached_device


def predict_image(image_input: Union[str, "Image.Image"]) -> dict:
    """
    Predict the skin condition from an image.

    Args:
        image_input: Either a file path (str) or a PIL Image object.

    Returns:
        dict with the following keys:
          "class"      (str)   : Short class code, e.g. "nv"
          "label"      (str)   : Human-readable name, e.g. "Melanocytic Nevi"
          "confidence" (float) : Probability of the top prediction (0.0–1.0)
          "all_scores" (dict)  : Softmax probability for every class

    Raises:
        FileNotFoundError: If the model checkpoint doesn't exist yet.
        ValueError:        If the image cannot be opened or processed.

    Example:
        result = predict_image("sample_images/ISIC_0024306.jpg")
        print(f"{result['label']} — {result['confidence']*100:.1f}% confident")
    """
    # ── Load image ────────────────────────────────────────────────────────────
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise ValueError(f"Image file not found: {image_input}")
        try:
            image = Image.open(image_input).convert("RGB")
        except Exception as e:
            raise ValueError(f"Could not open image '{image_input}': {e}") from e
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")
    else:
        raise TypeError(
            f"image_input must be a file path (str) or PIL Image, "
            f"got {type(image_input).__name__}"
        )

    # ── Preprocess ───────────────────────────────────────────────────────────
    # Add batch dimension: [3, 224, 224] → [1, 3, 224, 224]
    tensor = _INFERENCE_TRANSFORM(image).unsqueeze(0)

    # ── Load model and run inference ─────────────────────────────────────────
    model, device = _get_model()
    tensor = tensor.to(device)

    with torch.no_grad():
        logits = model(tensor)                          # [1, 7]
        probs  = torch.softmax(logits, dim=1)[0]       # [7]

    # ── Extract top prediction ────────────────────────────────────────────────
    top_idx        = int(probs.argmax().item())
    top_class      = CLASS_NAMES[top_idx]
    top_label      = CLASS_LABELS[top_class]
    top_confidence = float(probs[top_idx].item())

    # Build the full scores dict (all 7 classes)
    all_scores = {
        CLASS_NAMES[i]: round(float(probs[i].item()), 6)
        for i in range(len(CLASS_NAMES))
    }

    return {
        "class":      top_class,
        "label":      top_label,
        "confidence": round(top_confidence, 6),
        "all_scores": all_scores,
    }


def predict_top_k(image_input: Union[str, "Image.Image"], k: int = 3) -> list:
    """
    Return the top-k predictions for an image, sorted by confidence.

    Args:
        image_input : File path or PIL Image
        k           : Number of top predictions to return (default: 3)

    Returns:
        list of dicts, each with "class", "label", "confidence"

    Example:
        for pred in predict_top_k("image.jpg", k=3):
            print(f"{pred['label']}: {pred['confidence']*100:.1f}%")
    """
    result = predict_image(image_input)
    all_scores = result["all_scores"]

    top_k = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)[:k]
    return [
        {
            "class":      cls,
            "label":      CLASS_LABELS[cls],
            "confidence": score,
        }
        for cls, score in top_k
    ]


# ── Command-line usage ────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/predict.py <path_to_image.jpg>")
        print("\nExample:")
        print("  python src/predict.py sample_images/ISIC_0024306.jpg")
        sys.exit(1)

    image_path = sys.argv[1]
    print(f"\nRunning prediction on: {image_path}")
    print("-" * 50)

    result = predict_image(image_path)

    print(f"\n✅ Prediction Result:")
    print(f"   Class      : {result['class']}")
    print(f"   Label      : {result['label']}")
    print(f"   Confidence : {result['confidence']*100:.2f}%")
    print(f"\n   All class scores:")
    for cls, score in sorted(result["all_scores"].items(), key=lambda x: -x[1]):
        bar = "█" * int(score * 30)
        print(f"     {cls:<8}: {score*100:5.1f}%  {bar}")

    print("\n⚠️  DISCLAIMER: For educational use only. Not a medical diagnostic tool.")
