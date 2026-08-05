"""
Trains the skin-type classifier (dry / normal / oily) — VERSION 3.

Key change from v1/v2: uses EfficientNetB0 instead of MobileNetV2.
This matches the architecture used in published work on this exact task
(oily/dry/normal classification), which reported ~80% validation accuracy.
MobileNetV2 (v1/v2 of our script) plateaued at ~41% despite multiple fixes
(class weighting, regularization, careful fine-tuning) — suggesting the
base model itself wasn't capturing the fine texture/color cues needed,
not a training-process problem.

Usage:
    python train_skin_type_v3.py
"""

import os
import tensorflow as tf
from tensorflow.keras import layers

DATA_DIR = "datasets/skin-types/Oily-Dry-Skin-Types"
IMG_SIZE = (224, 224)  # EfficientNetB0's native size
BATCH_SIZE = 16
EPOCHS_PHASE1 = 25
EPOCHS_PHASE2 = 10
MODEL_OUT = "models/skin_type_model.keras"

os.makedirs("models", exist_ok=True)

train_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, "train"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    shuffle=True,
    seed=42,
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, "valid"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

class_names = train_ds.class_names
print(f"\nClasses found: {class_names}\n")

with open("models/skin_type_classes.txt", "w") as f:
    f.write("\n".join(class_names))

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# Class weights (same fix as before — "dry" is the smallest class)
class_counts = {}
train_dir = os.path.join(DATA_DIR, "train")
for name in class_names:
    class_counts[name] = len(os.listdir(os.path.join(train_dir, name)))
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

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.15),
])

# ---------------------------------------------------------------------------
# EfficientNetB0 instead of MobileNetV2 — the key change in this version
# ---------------------------------------------------------------------------
base_model = tf.keras.applications.EfficientNetB0(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
# EfficientNet has its own preprocessing built into the architecture choice;
# it expects raw 0-255 pixel values, no manual preprocess_input needed here
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(64, activation="relu")(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(len(class_names), activation="softmax")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy", patience=5, restore_best_weights=True, verbose=1
)
reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1
)
checkpoint = tf.keras.callbacks.ModelCheckpoint(
    MODEL_OUT, monitor="val_accuracy", save_best_only=True, verbose=1
)

print("=" * 60)
print("Phase 1: Training top layers (EfficientNetB0 base frozen)")
print("=" * 60)
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE1,
    callbacks=[early_stop, reduce_lr, checkpoint],
    class_weight=class_weight,
)

best_val_acc = max(history.history["val_accuracy"])
print(f"\nPhase 1 done. Best validation accuracy: {best_val_acc:.2%}\n")

# Careful fine-tuning
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

finetune_early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy", patience=4, restore_best_weights=True, verbose=1
)

print("=" * 60)
print("Phase 2: Careful fine-tuning (last 20 layers, low LR)")
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