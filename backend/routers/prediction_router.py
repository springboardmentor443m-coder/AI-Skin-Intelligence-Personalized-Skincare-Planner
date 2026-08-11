"""
routers/prediction_router.py — Skin Lesion Prediction Endpoint
================================================================
Phase 8: ML Inference API

Endpoint defined here:
  POST /api/predict   — Accept an uploaded skin image, run it through
                        the trained EfficientNetB0 model, return prediction.

Design decisions:
  - The model is loaded ONCE at module import time (startup) and cached
    in _predictor.  Subsequent requests reuse the cached model so there
    is no per-request disk I/O.
  - The ml/ directory is added to sys.path here (and only here) so we
    can import the existing ml/src/predict.py without moving any files.
  - The endpoint is JWT-protected via get_current_user so only
    authenticated users can run predictions.
  - We validate the uploaded file's content type AND attempt to open it
    with Pillow to detect corrupted or non-image files.

Authentication:
  All requests must carry:   Authorization: Bearer <jwt_token>

Example response (success):
  {
    "class":       "nv",
    "label":       "Melanocytic Nevi",
    "confidence":  0.8312,
    "all_scores": {
        "akiec": 0.012,
        "bcc":   0.031,
        "bkl":   0.049,
        "df":    0.005,
        "mel":   0.063,
        "nv":    0.831,
        "vasc":  0.009
    },
    "disclaimer":  "..."
  }

DISCLAIMER:
  This API is for EDUCATIONAL / RESEARCH purposes only.
  It is NOT a medical diagnostic tool. Always consult a
  qualified dermatologist for clinical decisions.
"""

import io
import os
import sys
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image

# ── Add ml/ to sys.path so existing ml/src/* imports resolve ─────────────────
#
# The ml/ directory lives at:  <project_root>/ml/
# This file lives at:          <project_root>/backend/routers/prediction_router.py
#
# We compute the project root from this file's location, then add ml/ once.
# This is the ONLY place where sys.path is modified.

_THIS_FILE  = Path(__file__).resolve()          # .../backend/routers/prediction_router.py
_BACKEND    = _THIS_FILE.parent.parent           # .../backend/
_PROJECT    = _BACKEND.parent                    # project root
_ML_ROOT    = _PROJECT / "ml"                   # .../ml/

if str(_ML_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_ROOT))

# ── Now safe to import the ml package ────────────────────────────────────────
try:
    from src.predict import predict_image          # noqa: E402
    from src.config import CLASS_NAMES, CLASS_LABELS  # noqa: E402
except ImportError as exc:
    raise RuntimeError(
        f"\n\n❌  Could not import ml/src/predict.py.\n"
        f"    Make sure ml/ exists at: {_ML_ROOT}\n"
        f"    Original error: {exc}\n"
    ) from exc

# ── FastAPI auth dependency ─────────────────────────────────────────────────────
from auth import get_current_user  # noqa: E402
from database import get_db        # noqa: E402
from models import Assessment, User  # noqa: E402
from sqlalchemy.orm import Session   # noqa: E402

# ── Logger ────────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Allowed MIME types ────────────────────────────────────────────────────────
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB hard limit

# ── Medical disclaimer (returned with every prediction) ──────────────────────
DISCLAIMER = (
    "⚠️ FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY. "
    "This AI prediction is NOT a medical diagnosis and must NOT be used "
    "to make clinical decisions. Always consult a qualified dermatologist "
    "or healthcare professional for any skin concerns."
)

# ── Warm up the model at import time ─────────────────────────────────────────
#
# Calling predict_image() once with a tiny dummy image forces the model
# checkpoint to be loaded from disk and cached in ml/src/predict.py's
# _cached_model variable.  All subsequent API requests hit the cache and
# return immediately without disk I/O.
#
# If the model file does not exist yet (e.g., fresh clone before training),
# we log a warning and skip the warm-up — the first real request will load it.

def _warm_up_model() -> None:
    """Load the model once at startup so the first API request is fast."""
    try:
        dummy = Image.new("RGB", (224, 224), color=(128, 128, 128))
        predict_image(dummy)
        logger.info("[prediction_router] ✓ EfficientNetB0 model loaded and cached at startup.")
    except FileNotFoundError as exc:
        logger.warning(
            "[prediction_router] ⚠️  Model checkpoint not found — "
            "it will be loaded on the first request.\n  %s", exc
        )
    except Exception as exc:
        logger.warning(
            "[prediction_router] ⚠️  Model warm-up failed: %s. "
            "Prediction may be slow on the first request.", exc
        )


_warm_up_model()


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"],
)

# ── Risk level map (matches SkinAssessment.jsx CLASS_META) ─────────────────────
#
# Derived from the HAM10000 clinical literature.
# akiec, bcc, mel = High risk (potentially malignant)
# bkl, df, nv, vasc = Low risk (typically benign)
CLASS_RISK = {
    "akiec": "High",
    "bcc":   "High",
    "bkl":   "Low",
    "df":    "Low",
    "mel":   "High",
    "nv":    "Low",
    "vasc":  "Low",
}


# ── POST /api/predict ─────────────────────────────────────────────────────────

@router.post(
    "",
    summary="Predict skin lesion class from an uploaded image",
    description=(
        "Upload a skin lesion image (JPEG, PNG, WebP, BMP, or TIFF). "
        "The trained EfficientNetB0 model will classify it into one of 7 "
        "HAM10000 skin lesion categories and return the predicted class, "
        "confidence score, and full probability distribution.\n\n"
        "**Requires** `Authorization: Bearer <token>` header.\n\n"
        "⚠️ **Medical disclaimer**: This is for educational/research purposes "
        "only and is NOT a medical diagnostic tool."
    ),
    response_description=(
        "Prediction result including class code, human-readable label, "
        "confidence score (0–1), all class probabilities, and a medical disclaimer."
    ),
)
async def predict(
    file: UploadFile = File(
        ...,
        description="Skin lesion image (JPEG / PNG / WebP / BMP / TIFF, max 10 MB)"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Classify a skin lesion image using the trained EfficientNetB0 model.

    Steps:
      1. Validate Content-Type header (must be an image MIME type).
      2. Read the file bytes into memory (enforce 10 MB limit).
      3. Attempt to open with Pillow — rejects corrupted / non-image files.
      4. Call predict_image() from ml/src/predict.py (uses cached model).
      5. Return prediction JSON with a medical disclaimer.

    Raises:
      HTTP 400 — unsupported file type, file too large, or corrupted image.
      HTTP 500 — unexpected model inference error.
    """
    # ── Step 1: Validate MIME type ────────────────────────────────────────────
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type: '{content_type}'. "
                f"Please upload a JPEG, PNG, WebP, BMP, or TIFF image."
            ),
        )

    # ── Step 2: Read file bytes (enforce size limit) ──────────────────────────
    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {exc}",
        ) from exc

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please upload a valid image.",
        )

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        mb = len(file_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({mb:.1f} MB). Maximum allowed size is 10 MB.",
        )

    # ── Step 3: Open with Pillow (validates image integrity) ─────────────────
    try:
        pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        # Verify the image is not truncated/corrupted
        pil_image.verify()
        # Re-open after verify() — Pillow closes the image after verify
        pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Could not read the uploaded image. "
                f"The file may be corrupted or is not a valid image. "
                f"Details: {exc}"
            ),
        ) from exc

    # ── Step 4: Run ML inference ──────────────────────────────────────────────
    try:
        result = predict_image(pil_image)
    except FileNotFoundError as exc:
        logger.error("[prediction_router] Model file not found: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The AI model is not yet available. "
                "Please contact the administrator."
            ),
        ) from exc
    except Exception as exc:
        logger.exception("[prediction_router] Unexpected inference error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed due to an internal error: {exc}",
        ) from exc

    # ── Step 5: Return result ─────────────────────────────────────────────────────
    logger.info(
        "[prediction_router] Prediction for user %s: %s (%.1f%%)",
        current_user.email,
        result["class"],
        result["confidence"] * 100,
    )

    # ── Step 6: Save assessment to PostgreSQL (Phase 10) ───────────────────────
    #
    # Only reached when inference succeeded. Failed predictions are never saved.
    # The risk level is derived from CLASS_RISK — not stored by the ML model itself.
    risk = CLASS_RISK.get(result["class"], "Low")
    try:
        assessment = Assessment(
            user_id         = current_user.id,
            predicted_class = result["class"],
            predicted_label = result["label"],
            confidence      = result["confidence"],
            risk_level      = risk,
            all_scores      = result["all_scores"],
            disclaimer      = DISCLAIMER,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        logger.info(
            "[prediction_router] Assessment %d saved for user %s.",
            assessment.id,
            current_user.email,
        )
    except Exception as exc:
        # Do NOT fail the API response if the DB save fails.
        # The user still gets their prediction result.
        logger.error(
            "[prediction_router] Failed to save assessment for user %s: %s",
            current_user.email,
            exc,
        )
        db.rollback()

    return {
        "class":       result["class"],
        "label":       result["label"],
        "confidence":  result["confidence"],
        "all_scores":  result["all_scores"],
        "disclaimer":  DISCLAIMER,
    }
