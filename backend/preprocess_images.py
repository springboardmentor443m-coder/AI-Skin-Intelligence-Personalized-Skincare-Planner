
import os
from pathlib import Path

import cv2
import numpy as np

IMAGE_SIZE = (224, 224)

# Update this path after downloading the image dataset
DATASET_PATH = Path(r"C:\PATH\TO\YOUR\IMAGE_DATASET")


def load_images(dataset_path):
    """
    Load images from dataset folders.

    Expected folder structure:

    dataset/
        Acne/
        Blackheads/
        Whiteheads/
    """

    images = []
    labels = []

    if not dataset_path.exists():
        print("Dataset path not found.")
        return images, labels

    classes = sorted(
        [folder.name for folder in dataset_path.iterdir() if folder.is_dir()]
    )

    print(f"Found Classes: {classes}")

    for label, class_name in enumerate(classes):

        class_folder = dataset_path / class_name

        print(f"\nReading {class_name}...")

        for image_file in class_folder.iterdir():

            image = cv2.imread(str(image_file))

            if image is None:
                continue

            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, IMAGE_SIZE)

            image = image / 255.0

            images.append(image)
            labels.append(label)

    return np.array(images), np.array(labels)


if __name__ == "__main__":

    X, y = load_images(DATASET_PATH)

    print("\n------------------------")
    print("Dataset Loaded")
    print("------------------------")

    print(f"Images : {len(X)}")
    print(f"Labels : {len(y)}")