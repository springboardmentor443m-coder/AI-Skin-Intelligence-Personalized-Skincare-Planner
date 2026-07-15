"""
Builds a confusion matrix for the skin-concern model — shows exactly which
classes get mixed up with which, so we can target the real problem instead
of guessing.

Usage:
    python confusion_matrix.py
"""

import os
import numpy as np
import tensorflow as tf

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
)
class_names = val_ds.class_names
n = len(class_names)

y_true = []
y_pred = []

for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    y_pred.extend(np.argmax(preds, axis=1))
    y_true.extend(np.argmax(labels.numpy(), axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

# Build the matrix: rows = actual class, columns = what it got predicted as
matrix = np.zeros((n, n), dtype=int)
for t, p in zip(y_true, y_pred):
    matrix[t][p] += 1

# Print header
short_names = [c[:10] for c in class_names]
print("\n" + "=" * 100)
print("CONFUSION MATRIX  (rows = actual class, columns = predicted class)")
print("=" * 100)
header = "Actual \\ Pred".ljust(20) + "".join(n.rjust(12) for n in short_names)
print(header)

for i, name in enumerate(class_names):
    row = name[:18].ljust(20) + "".join(str(matrix[i][j]).rjust(12) for j in range(n))
    print(row)

print("\n" + "=" * 100)
print("TOP CONFUSIONS (excluding correct predictions)")
print("=" * 100)
confusions = []
for i in range(n):
    for j in range(n):
        if i != j and matrix[i][j] > 0:
            confusions.append((matrix[i][j], class_names[i], class_names[j]))
confusions.sort(reverse=True)
for count, actual, predicted in confusions[:10]:
    print(f"  {count:3d}x  '{actual}' was predicted as '{predicted}'")
print("=" * 100)