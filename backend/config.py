# ==============================================================================
# backend/config.py
# ==============================================================================

from pathlib import Path
import torch


# ==============================================================================
# PROJECT PATHS
# ==============================================================================

# backend/
BACKEND_DIR = Path(__file__).resolve().parent

# virtual-internship/
PROJECT_ROOT = BACKEND_DIR.parent

# datasets/
DATASET_DIR = PROJECT_ROOT / "datasets" / "final_split_dataset"

# models/
MODEL_DIR = PROJECT_ROOT / "models"

# uploads/
UPLOAD_DIR = BACKEND_DIR / "uploads"

# ==============================================================================
# MODEL
# ==============================================================================

MODEL_PATH = MODEL_DIR / "mobilenetv2_finetuned_best.pth"

# ==============================================================================
# HARDWARE
# ==============================================================================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==============================================================================
# IMAGE CONFIGURATION
# ==============================================================================

IMAGE_SIZE = 224

TOP_K = 3

# ==============================================================================
# APP CONFIGURATION
# ==============================================================================

API_TITLE = "Skin Disease Classification API"

API_VERSION = "1.0.0"

# ==============================================================================
# CREATE REQUIRED DIRECTORIES
# ==============================================================================

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.5-flash"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"