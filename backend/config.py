from pathlib import Path

# Root Project Folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Dataset Paths
DATASETS_DIR = BASE_DIR / "datasets"
SEPHORA_DIR = DATASETS_DIR / "sephora"
IMAGE_DATASET_DIR = DATASETS_DIR / "images"

# Models
MODELS_DIR = BASE_DIR / "models"

# Outputs
OUTPUTS_DIR = BASE_DIR / "outputs"

# Image Settings
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10