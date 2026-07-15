"""
Cleans the skin-concern dataset before training:
  - Opens every image
  - Converts it to standard RGB (fixes grayscale, RGBA/transparency, CMYK issues)
  - Re-saves it as a clean JPEG
  - Deletes any file that's corrupted/unreadable entirely

This fixes the "Number of channels requested does not match input" error,
which happens when TensorFlow hits a non-RGB image mixed into the dataset.

Usage:
    python clean_dataset.py
"""

import os
from PIL import Image

DATA_DIR = "datasets/facial-skin-acne-pigmentation/dataset"

fixed_count = 0
deleted_count = 0
ok_count = 0

for class_name in os.listdir(DATA_DIR):
    class_path = os.path.join(DATA_DIR, class_name)
    if not os.path.isdir(class_path):
        continue

    for filename in os.listdir(class_path):
        filepath = os.path.join(class_path, filename)

        if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue

        try:
            img = Image.open(filepath)
            img.load()  # force-read the full file, catches truncated files too

            if img.mode != "RGB":
                img = img.convert("RGB")
                img.save(filepath, "JPEG", quality=95)
                fixed_count += 1
            else:
                ok_count += 1

        except Exception as e:
            print(f"  [DELETING corrupted file] {filepath} ({e})")
            os.remove(filepath)
            deleted_count += 1

print("\n" + "=" * 60)
print("CLEANING COMPLETE")
print("=" * 60)
print(f"  Already fine:       {ok_count}")
print(f"  Fixed (converted):  {fixed_count}")
print(f"  Deleted (corrupt):  {deleted_count}")
print("=" * 60)