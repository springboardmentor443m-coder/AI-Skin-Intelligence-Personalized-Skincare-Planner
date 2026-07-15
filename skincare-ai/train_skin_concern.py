"""
Trains an 8-class skin concern classifier:
dark spots / inflammatory acne / non-inflammatory whiteheads /
non-inflammatory blackheads / pigmentation / pores / redness / wrinkles

Built with lessons learned from the skin-type model:
  - Class weighting from the start (not added later)
  - 224x224 images (MobileNetV2 native size)
  - Careful, limited fine-tuning (last 15 layers only)
  - Early stopping to prevent overfitting

This dataset has NO pre-made train/valid split (unlike skin-types), so this
script creates one automatically: 85% train / 15% validation.

Usage:
    python train_skin_concern.py

Output:
    models/skin_concern_model.keras
"""

import os
import tensorflow as tf
from tensorflow.keras import layers

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DATA_DIR = "datasets/facial-skin-acne-pigmentation/dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS_PHASE1 = 25
EPOCHS_PHASE2 = 10
MODEL_OUT = "models/skin_concern_model.keras"
VALIDATION_SPLIT = 0.15

os.makedirs("models", exist_ok=True)

# ---------------------------------------------------------------------------
# Load data — auto-split since this dataset has no separate train/valid folders
# ---------------------------------------------------------------------------
train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

class_names = train_ds.class_names
print(f"\nClasses found ({len(class_names)}): {class_names}\n")

with open("models/skin_concern_classes.txt", "w") as f:
    f.write("\n".join(class_names))

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# ---------------------------------------------------------------------------
# Class weights (this dataset is fairly balanced already, 300-619 per class,
# but we apply weighting anyway as good practice)
# ---------------------------------------------------------------------------
class_counts = {}
for name in class_names:
    class_counts[name] = len(
        [f for f in os.listdir(os.path.join(DATA_DIR, name))
         if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    )

total = sum(class_counts.values())
num_classes = len(class_names)
class_weight = {
    idx: total / (num_classes * class_counts[name])
    for idx, name in enumerate(class_names)
}
print("Class weights:")
for idx, name in enumerate(class_names):
    print(f"  {name}: {class_weight[idx]:.3f}")
print()

# ---------------------------------------------------------------------------
# Data augmentation
# ---------------------------------------------------------------------------
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.1),
])

# ---------------------------------------------------------------------------
# Build model
# ---------------------------------------------------------------------------
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.5)(x)
x = layers.Dense(128, activation="relu")(x)  # slightly bigger — more classes than skin-type
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(len(class_names), activation="softmax")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=5,
    restore_best_weights=True,
    verbose=1,
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=1e-6,
    verbose=1,
)

# Saves the best model to disk after EVERY epoch — so if training crashes
# partway through (e.g. system memory issue), we don't lose all progress.
checkpoint = tf.keras.callbacks.ModelCheckpoint(
    MODEL_OUT,
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1,
)

print("=" * 60)
print("Phase 1: Training top layers (base model frozen)")
print("=" * 60)
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE1,
    callbacks=[early_stop, reduce_lr, checkpoint],
    class_weight=class_weight,
)

best_val_acc = max(history.history["val_accuracy"])
print("\n" + "=" * 60)
print(f"Phase 1 done. Best validation accuracy: {best_val_acc:.2%}")
print("=" * 60)

# ---------------------------------------------------------------------------
# Phase 2: careful fine-tuning
# ---------------------------------------------------------------------------
base_model.trainable = True
for layer in base_model.layers[:-15]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

finetune_early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=4,
    restore_best_weights=True,
    verbose=1,
)

print("\n" + "=" * 60)
print("Phase 2: Careful fine-tuning (last 15 layers, low LR)")
print("=" * 60)
history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE2,
    callbacks=[finetune_early_stop, checkpoint],
    class_weight=class_weight,
)

final_val_acc = max(history2.history["val_accuracy"])
if final_val_acc > best_val_acc:
    print(f"\nFine-tuning IMPROVED accuracy: {best_val_acc:.2%} -> {final_val_acc:.2%}")
else:
    print(f"\nFine-tuning did NOT improve accuracy (stayed at ~{best_val_acc:.2%})")
best_val_acc = max(best_val_acc, final_val_acc)

print("\n" + "=" * 60)
print(f"DONE. Best validation accuracy achieved: {best_val_acc:.2%}")
print(f"Model saved to: {MODEL_OUT}")
print("=" * 60)