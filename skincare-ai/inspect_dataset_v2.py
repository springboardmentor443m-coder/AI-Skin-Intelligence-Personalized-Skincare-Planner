"""
Saves a grid of sample images from each skin-type class, so we can
visually inspect whether the labels actually look consistent/distinguishable
to a human eye. This is a real diagnostic step we haven't done yet —
useful before trying yet another training variant blindly.

Usage:
    python inspect_dataset.py
"""

import os
import random
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = "datasets/Skin Type Identification Research/Train"
SAMPLES_PER_CLASS = 6
THUMB_SIZE = (200, 200)
OUTPUT_FILE = "dataset_inspection.png"

class_names = sorted(
    d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))
)

grid_width = SAMPLES_PER_CLASS * THUMB_SIZE[0]
grid_height = len(class_names) * (THUMB_SIZE[1] + 30)  # +30 for label space

canvas = Image.new("RGB", (grid_width, grid_height), color="white")
draw = ImageDraw.Draw(canvas)

for row, class_name in enumerate(class_names):
    class_path = os.path.join(DATA_DIR, class_name)
    images = [
        f for f in os.listdir(class_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ]
    sample = random.sample(images, min(SAMPLES_PER_CLASS, len(images)))

    y_offset = row * (THUMB_SIZE[1] + 30)
    draw.text((5, y_offset), f"{class_name} ({len(images)} images)", fill="black")

    for col, img_name in enumerate(sample):
        img_path = os.path.join(class_path, img_name)
        try:
            img = Image.open(img_path).convert("RGB")
            img = img.resize(THUMB_SIZE)
            canvas.paste(img, (col * THUMB_SIZE[0], y_offset + 20))
        except Exception as e:
            print(f"Skipped {img_path}: {e}")

canvas.save(OUTPUT_FILE)
print(f"\nSaved inspection grid to: {OUTPUT_FILE}")
print("Open this image and look at each row — do the classes look visually distinct to you?")