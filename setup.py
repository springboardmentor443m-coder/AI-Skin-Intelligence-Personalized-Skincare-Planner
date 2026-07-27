from pathlib import Path

project_root = Path.cwd()

folders = [
    "notebooks",
    "datasets/raw",
    "datasets/master_skin_dataset",
    "datasets/balanced_skin_dataset",
    "datasets/final_split_dataset",
    "kaggle",
    "models",
    "outputs",
    "logs",
    "src",
]

for folder in folders:
    (project_root / folder).mkdir(parents=True, exist_ok=True)

files = [
    "README.md",
    "requirements.txt",
]

for file in files:
    (project_root / file).touch(exist_ok=True)

print("✅ Project structure created successfully!")
