"""
Diagnostic: loads the trained model and checks its predictions on the
validation set in detail — specifically, whether it's just guessing
the majority class every time (a common failure mode) rather than
genuinely learning to tell classes apart.

Usage:
    python evaluate_skin_type.py
"""

import os
import numpy as np
import tensorflow as tf
from collections import Counter

DATA_DIR = "datasets/facial-skin-acne-pigmentation/dataset"
IMG_SIZE = (224, 224)
MODEL_PATH = "models/skin_concern_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.15,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=32,
    label_mode="categorical",
    # NOTE: do NOT set shuffle=False here — it disables the pre-split
    # shuffle too, causing a broken, class-skewed validation subset.
)
class_names = val_ds.class_names

y_true = []
y_pred = []

for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    y_pred.extend(np.argmax(preds, axis=1))
    y_true.extend(np.argmax(labels.numpy(), axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

print("\n" + "=" * 60)
print("PREDICTION DISTRIBUTION (what the model actually guessed)")
print("=" * 60)
pred_counts = Counter(y_pred)
for idx, name in enumerate(class_names):
    count = pred_counts.get(idx, 0)
    pct = count / len(y_pred) * 100
    print(f"  Predicted '{name}': {count:4d} times ({pct:.1f}% of all predictions)")

print("\n" + "=" * 60)
print("ACTUAL DISTRIBUTION (true labels in validation set)")
print("=" * 60)
true_counts = Counter(y_true)
for idx, name in enumerate(class_names):
    count = true_counts.get(idx, 0)
    pct = count / len(y_true) * 100
    print(f"  Actual '{name}': {count:4d} times ({pct:.1f}% of validation set)")

print("\n" + "=" * 60)
print("PER-CLASS ACCURACY (how well it does on EACH class)")
print("=" * 60)
for idx, name in enumerate(class_names):
    mask = y_true == idx
    if mask.sum() == 0:
        continue
    class_acc = (y_pred[mask] == idx).mean()
    print(f"  '{name}': {class_acc:.1%} correct  ({mask.sum()} images)")

overall_acc = (y_pred == y_true).mean()
print(f"\nOverall accuracy: {overall_acc:.1%}")
print("=" * 60)

