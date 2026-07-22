from pathlib import Path
import cv2
import os

# ==========================
# Dataset Paths
# ==========================

RAW_DATASET = Path("datasets/raw/mentor_dataset")
PROCESSED_DATASET = Path("datasets/processed")

IMAGE_SIZE = (224, 224)

# Create processed folder
PROCESSED_DATASET.mkdir(parents=True, exist_ok=True)

total_images = 0
processed_images = 0
corrupt_images = 0

print("=" * 60)
print("Starting Image Preprocessing")
print("=" * 60)

# Loop through each class folder
for class_folder in RAW_DATASET.iterdir():

    if not class_folder.is_dir():
        continue

    class_name = class_folder.name
    print(f"\nProcessing Class: {class_name}")

    output_folder = PROCESSED_DATASET / class_name
    output_folder.mkdir(exist_ok=True)

    class_count = 0

    for image_path in class_folder.iterdir():

        if image_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue

        total_images += 1

        image = cv2.imread(str(image_path))

        if image is None:
            corrupt_images += 1
            continue

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        image = cv2.resize(image, IMAGE_SIZE)

        save_path = output_folder / image_path.name

        cv2.imwrite(str(save_path), cv2.cvtColor(image, cv2.COLOR_RGB2BGR))

        processed_images += 1
        class_count += 1

    print(f"Images Processed: {class_count}")

print("\n" + "=" * 60)
print("Preprocessing Complete")
print("=" * 60)

print(f"Total Images Found     : {total_images}")
print(f"Successfully Processed : {processed_images}")
print(f"Corrupt Images         : {corrupt_images}")