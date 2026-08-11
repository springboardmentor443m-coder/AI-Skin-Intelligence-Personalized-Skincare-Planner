"""
src/config.py — Central Configuration
=======================================
Phase 7: ML Pipeline

All constants used by dataset.py, model.py, train.py, evaluate.py,
and predict.py are defined here in one place.

To change a setting (e.g. image size, batch size, number of epochs),
edit this file — no need to hunt through multiple scripts.
"""

import os

# ── Paths ─────────────────────────────────────────────────────────────────────
# All paths are relative to the ml/ directory.
# The training scripts (train.py, evaluate.py) are run from ml/.

# Root of the ml/ folder — used to build absolute paths from anywhere
ML_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_DIR   = os.path.join(ML_ROOT, "dataset", "HAM10000")
IMAGES_DIR    = os.path.join(DATASET_DIR, "images")
METADATA_CSV  = os.path.join(DATASET_DIR, "HAM10000_metadata.csv")
MODELS_DIR    = os.path.join(ML_ROOT, "models")
MODEL_PATH    = os.path.join(MODELS_DIR, "efficientnetb0_ham10000.pt")

# ── Dataset ───────────────────────────────────────────────────────────────────

# HAM10000 has 7 diagnostic classes.
# The class names match the 'dx' column in HAM10000_metadata.csv.
CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# Human-readable display labels (same order as CLASS_NAMES)
CLASS_LABELS = {
    "akiec": "Actinic Keratoses / Intraepithelial Carcinoma",
    "bcc":   "Basal Cell Carcinoma",
    "bkl":   "Benign Keratosis-like Lesions",
    "df":    "Dermatofibroma",
    "mel":   "Melanoma",
    "nv":    "Melanocytic Nevi",
    "vasc":  "Vascular Lesions",
}

NUM_CLASSES = len(CLASS_NAMES)  # 7

# ── Image Preprocessing ───────────────────────────────────────────────────────

# EfficientNetB0 expects 224×224 RGB images.
# During training, images are first resized to 256, then centre-cropped to 224.
# During inference (prediction), same pipeline applies.
IMAGE_SIZE        = 224     # Final input size for the model
RESIZE_SIZE       = 256     # Resize before centre-crop (avoids edge artifacts)

# ImageNet normalisation constants — used because the model was pretrained on ImageNet.
# Subtracting the mean and dividing by std puts each channel in a similar range,
# which helps the pretrained feature maps work on skin images too.
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

# ── Train / Val / Test Split ──────────────────────────────────────────────────

# We split the 10,015 images into three non-overlapping sets.
# Stratified split ensures each set has the same class distribution.
#   70% train   ≈ 7,010 images
#   15% val     ≈ 1,502 images  (used to pick the best checkpoint)
#   15% test    ≈ 1,503 images  (held out until final evaluation — never seen during training)
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.15
TEST_RATIO  = 0.15            # implicit: 1 - TRAIN_RATIO - VAL_RATIO
RANDOM_SEED = 42              # Fixed seed for reproducibility

# ── Training Hyperparameters ──────────────────────────────────────────────────

BATCH_SIZE         = 32       # Images per mini-batch. Reduce to 16 if GPU OOM.
NUM_WORKERS        = 2        # DataLoader worker threads. Use 0 on Windows if errors occur.

# Phase 1: Feature extraction — train only the new head, backbone frozen
PHASE1_EPOCHS      = 5
PHASE1_LR          = 1e-3     # Higher LR is fine when backbone is frozen

# Phase 2: Fine-tuning — unfreeze top backbone layers, train with low LR
PHASE2_EPOCHS      = 10
PHASE2_LR          = 1e-5     # Very small LR to avoid destroying pretrained weights

# Learning rate scheduler: reduce LR when validation loss plateaus
LR_PATIENCE        = 3        # Epochs to wait before reducing LR
LR_FACTOR          = 0.5      # Multiply LR by this factor when patience runs out
LR_MIN             = 1e-7     # Floor for LR reduction

# Early stopping: stop training if val_loss doesn't improve
EARLY_STOP_PATIENCE = 5       # Epochs without improvement before stopping
