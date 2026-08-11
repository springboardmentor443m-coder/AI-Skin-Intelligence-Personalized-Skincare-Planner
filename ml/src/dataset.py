"""
src/dataset.py — PyTorch Dataset for HAM10000
===============================================
Phase 7: ML Pipeline

What this module does:
  1. Reads HAM10000_metadata.csv to get image filenames and labels.
  2. Performs a stratified train / val / test split (no data leakage).
  3. Provides a PyTorch Dataset class that:
       - Loads each JPEG image from disk
       - Applies the appropriate transform (augmentation for train, none for val/test)
       - Returns (image_tensor, label_index) pairs for the DataLoader
  4. Returns configured DataLoaders for train, val, and test.
  5. Computes class weights for the weighted loss function (handles imbalance).

Usage:
  from src.dataset import get_dataloaders, CLASS_NAMES
  train_loader, val_loader, test_loader, class_weights = get_dataloaders()
"""

import os
import pandas as pd
import numpy as np
from PIL import Image

import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import transforms
from sklearn.model_selection import train_test_split

from src.config import (
    IMAGES_DIR, METADATA_CSV, CLASS_NAMES,
    IMAGE_SIZE, RESIZE_SIZE, IMAGENET_MEAN, IMAGENET_STD,
    BATCH_SIZE, NUM_WORKERS, TRAIN_RATIO, VAL_RATIO, RANDOM_SEED,
)


# ── Transform definitions ─────────────────────────────────────────────────────
#
# Training transform:
#   Random flips, rotations, and colour jitter augment the data artificially,
#   helping the model generalise to images it hasn't seen before.
#   Without augmentation, a 10k-image dataset would likely overfit quickly.
#
# Validation / Test transform:
#   No augmentation — we want a deterministic, fair evaluation.
#   Only resize + centre-crop + normalise.

def get_train_transform():
    return transforms.Compose([
        transforms.Resize(RESIZE_SIZE),
        transforms.RandomCrop(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_val_transform():
    return transforms.Compose([
        transforms.Resize(RESIZE_SIZE),
        transforms.CenterCrop(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


# ── HAM10000 Dataset class ────────────────────────────────────────────────────

class HAM10000Dataset(Dataset):
    """
    PyTorch Dataset for the HAM10000 skin lesion classification dataset.

    Args:
        df        : Pandas DataFrame with columns ['image_id', 'label_idx']
        images_dir: Path to the folder containing the JPEG images
        transform : torchvision transform to apply to each image

    Returns (per __getitem__):
        image (Tensor): Shape [3, IMAGE_SIZE, IMAGE_SIZE], float32, normalised
        label (int)   : Integer class index in range [0, NUM_CLASSES - 1]
    """

    def __init__(self, df: pd.DataFrame, images_dir: str, transform=None):
        self.df         = df.reset_index(drop=True)
        self.images_dir = images_dir
        self.transform  = transform

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int):
        row      = self.df.iloc[idx]
        img_path = os.path.join(self.images_dir, f"{row['image_id']}.jpg")

        # Load image — convert to RGB to handle any grayscale or RGBA images
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = int(row["label_idx"])
        return image, label


# ── Data loading entry point ──────────────────────────────────────────────────

def get_dataloaders(
    metadata_csv: str = METADATA_CSV,
    images_dir: str = IMAGES_DIR,
    batch_size: int = BATCH_SIZE,
    num_workers: int = NUM_WORKERS,
):
    """
    Load HAM10000 metadata, split into train/val/test, build DataLoaders.

    Steps:
      1. Read metadata CSV → get image_id + dx (diagnosis) columns
      2. Map diagnosis strings to integer indices (label_idx)
      3. Stratified split: 70% train / 15% val / 15% test
         (stratified = same class distribution in each split)
      4. Build HAM10000Dataset for each split with appropriate transforms
      5. Compute class weights for CrossEntropyLoss (handles imbalance)
      6. Build WeightedRandomSampler for the training DataLoader
         (oversample minority classes so batches are roughly balanced)

    Returns:
        train_loader  (DataLoader)
        val_loader    (DataLoader)
        test_loader   (DataLoader)
        class_weights (Tensor) — shape [NUM_CLASSES], for weighted loss
    """
    # ── Step 1: Load metadata ─────────────────────────────────────────────────
    if not os.path.exists(metadata_csv):
        raise FileNotFoundError(
            f"\n\nMetadata CSV not found at:\n  {metadata_csv}\n\n"
            "Please download the HAM10000 dataset first.\n"
            "See ml/README.md → 'Dataset Download' section.\n"
        )

    df = pd.read_csv(metadata_csv)

    # Keep only the columns we need
    df = df[["image_id", "dx"]].copy()

    # ── Step 2: Encode class labels to integers ───────────────────────────────
    # CLASS_NAMES is alphabetically sorted: ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
    class_to_idx = {cls: i for i, cls in enumerate(CLASS_NAMES)}
    df["label_idx"] = df["dx"].map(class_to_idx)

    # Sanity check: catch any unmapped labels
    unmapped = df["label_idx"].isna().sum()
    if unmapped > 0:
        unknown = df[df["label_idx"].isna()]["dx"].unique()
        raise ValueError(f"Found {unmapped} rows with unknown class labels: {unknown}")

    df["label_idx"] = df["label_idx"].astype(int)

    # ── Step 3: Stratified train / val / test split ───────────────────────────
    # Split 1: train (70%) vs temp (30%)
    train_df, temp_df = train_test_split(
        df,
        test_size=(VAL_RATIO + TEST_RATIO),
        stratify=df["label_idx"],
        random_state=RANDOM_SEED,
    )

    # Split 2: val (15%) vs test (15%) from the temp 30%
    val_ratio_of_temp = VAL_RATIO / (VAL_RATIO + TEST_RATIO)  # 0.5
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1 - val_ratio_of_temp),
        stratify=temp_df["label_idx"],
        random_state=RANDOM_SEED,
    )

    print(f"Dataset split:")
    print(f"  Train : {len(train_df):>5} images")
    print(f"  Val   : {len(val_df):>5} images")
    print(f"  Test  : {len(test_df):>5} images")
    print(f"  Total : {len(df):>5} images\n")

    # ── Step 4: Build Dataset objects ────────────────────────────────────────
    train_dataset = HAM10000Dataset(train_df, images_dir, transform=get_train_transform())
    val_dataset   = HAM10000Dataset(val_df,   images_dir, transform=get_val_transform())
    test_dataset  = HAM10000Dataset(test_df,  images_dir, transform=get_val_transform())

    # ── Step 5: Compute class weights for weighted loss ───────────────────────
    # Weight = total_samples / (num_classes * count_per_class)
    # Rare classes get higher weights → the loss penalises misclassifying them more.
    label_counts = train_df["label_idx"].value_counts().sort_index().values
    class_weights = len(train_df) / (len(CLASS_NAMES) * label_counts)
    class_weights_tensor = torch.FloatTensor(class_weights)

    # ── Step 6: WeightedRandomSampler for balanced training batches ───────────
    # Each sample's draw probability is proportional to its class weight.
    # This means minority classes (VASC, DF) appear more often in training batches.
    sample_weights = [class_weights[label] for label in train_df["label_idx"].values]
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(train_dataset),
        replacement=True,
    )

    # ── Step 7: Build DataLoaders ─────────────────────────────────────────────
    # pin_memory=True speeds up CPU → GPU transfer when a CUDA GPU is available.
    pin = torch.cuda.is_available()

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        sampler=sampler,      # WeightedRandomSampler (not shuffle=True)
        num_workers=num_workers,
        pin_memory=pin,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin,
    )

    return train_loader, val_loader, test_loader, class_weights_tensor


# ── Quick inspection helper ───────────────────────────────────────────────────

def print_class_distribution(metadata_csv: str = METADATA_CSV):
    """Print how many images exist per class in the full dataset."""
    df = pd.read_csv(metadata_csv)
    counts = df["dx"].value_counts().sort_index()
    print("\nHAM10000 Class Distribution:")
    print("-" * 45)
    for cls, count in counts.items():
        label = CLASS_NAMES.index(cls) if cls in CLASS_NAMES else "?"
        pct = 100 * count / len(df)
        bar = "█" * int(pct / 2)
        print(f"  {cls:<8} ({label}) : {count:>5}  ({pct:5.1f}%)  {bar}")
    print(f"\n  Total : {len(df)}")


if __name__ == "__main__":
    print_class_distribution()
