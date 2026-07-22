from pathlib import Path

# ==========================
# Project Root
# ==========================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ==========================
# Dataset Paths
# ==========================

DATASET_FOLDER = PROJECT_ROOT / "datasets"

IMAGE_DATASET = DATASET_FOLDER / "images"

SEPHORA_DATASET = DATASET_FOLDER / "sephora"

# ==========================
# Output Paths
# ==========================

MODELS_FOLDER = PROJECT_ROOT / "models"

OUTPUTS_FOLDER = PROJECT_ROOT / "outputs"

# ==========================
# Image Settings
# ==========================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

EPOCHS = 10

RANDOM_STATE = 42