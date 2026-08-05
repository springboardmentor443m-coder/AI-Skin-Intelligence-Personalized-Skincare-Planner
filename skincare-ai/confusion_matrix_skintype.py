"""
Builds a confusion matrix for the NEW skin-type model (v3, 5 classes) —
shows exactly which classes get mixed up with which. We're double-checking
the surprisingly high 97.78% result before trusting it fully.

Usage:
    python confusion_matrix_skintype.py
"""

import os
import numpy as np
import tensorflow as tf

DATA_DIR = "datasets/Skin Type Identification Research"
IMG_SIZE = (224, 224)
MODEL_PATH = "models/skin_type_model_v3.keras"

model = tf.keras.models.load_model(MODEL_PATH)

val_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, "Validation"),
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

matrix = np.zeros((n, n), dtype=int)
for t, p in zip(y_true, y_pred):
    matrix[t][p] += 1

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
print("PER-CLASS ACCURACY")
print("=" * 100)
total_correct = 0
total_images = 0
for i, name in enumerate(class_names):
    row_total = matrix[i].sum()
    correct = matrix[i][i]
    total_correct += correct
    total_images += row_total
    acc = correct / row_total if row_total > 0 else 0
    print(f"  {name:20s} {acc:.1%}  ({correct}/{row_total} images)")

print(f"\nOverall: {total_correct}/{total_images} = {total_correct/total_images:.2%}")
print("=" * 100)