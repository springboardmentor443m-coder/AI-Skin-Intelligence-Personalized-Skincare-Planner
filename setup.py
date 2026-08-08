from pathlib import Path

# ==============================================================================
# PROJECT ROOT
# ==============================================================================

PROJECT_ROOT = Path.cwd()

print("=" * 70)
print("SETTING UP PROJECT STRUCTURE")
print("=" * 70)

# ==============================================================================
# FOLDERS TO CREATE
# ==============================================================================

folders = [

    # Existing folders (safe)
    "notebooks",
    "datasets/raw",
    "datasets/master_skin_dataset",
    "datasets/balanced_skin_dataset",
    "datasets/final_split_dataset",
    "kaggle",
    "models",

    # New Backend Structure
    "backend",
    "backend/prediction",
    "backend/recommendation",
    "backend/llm",
    "backend/uploads",
    "backend/utils",

    # Frontend
    "frontend"
]

print("\nCreating folders...\n")

for folder in folders:

    path = PROJECT_ROOT / folder

    if not path.exists():
        path.mkdir(parents=True)
        print(f"✓ Created : {folder}")
    else:
        print(f"• Exists  : {folder}")

# ==============================================================================
# FILES TO CREATE
# ==============================================================================

files = [

    # Backend
    "backend/__init__.py",
    "backend/main.py",
    "backend/config.py",

    # Prediction Module
    "backend/prediction/__init__.py",
    "backend/prediction/predictor.py",
    "backend/prediction/preprocessing.py",
    "backend/prediction/labels.py",

    # Recommendation Module
    "backend/recommendation/__init__.py",
    "backend/recommendation/recommendation_engine.py",
    "backend/recommendation/prompt_builder.py",
    "backend/recommendation/templates.py",

    # LLM
    "backend/llm/__init__.py",
    "backend/llm/groq_client.py",

    # Utils
    "backend/utils/__init__.py",
    "backend/utils/image_utils.py"
]

print("\nCreating files...\n")

for file in files:

    path = PROJECT_ROOT / file

    if not path.exists():
        path.touch()
        print(f"✓ Created : {file}")
    else:
        print(f"• Exists  : {file}")

print("\n" + "=" * 70)
print("PROJECT STRUCTURE READY")
print("=" * 70)