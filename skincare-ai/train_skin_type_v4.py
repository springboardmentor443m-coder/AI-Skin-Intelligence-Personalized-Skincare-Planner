"""
Trains skin-type classifier v4 — using the NEW dataset
(skin_type_classification_dataset), which has 4 classes:
combination / dry / normal / oily, and appears to be more carefully
curated (Roboflow export with accompanying severity-score Excel files).

This tests whether our previous ~40% ceiling was caused by the OLD
dataset's label quality, rather than the model/training approach
(we already ruled out architecture choice with the EfficientNetB0 test).

Usage:
    python train_skin_type_v4.py
"""

import os
import tensorflow as tf
from tensorflow.keras import layers

DATA_DIR = "datasets/skin_type_classification_dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS_PHASE1 = 25
EPOCHS_PHASE2 = 10
MODEL_OUT = "models/skin_type_model_v2.keras"  # NEW filename - keeps old one safe

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
print(f"\nClasses found ({len(class_names)}): {class_names}\n")

with open("models/skin_type_classes_v2.txt", "w") as f:
    f.write("\n".join(class_names))

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# Class weights
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
print("Image counts and class weights:")
for idx, name in enumerate(class_names):
    print(f"  {name}: {class_counts[name]} images, weight {class_weight[idx]:.3f}")
print()

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.15),
])

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
print(f"\nPhase 1 done. Best validation accuracy: {best_val_acc:.2%}\n")

base_model.trainable = True
for layer in base_model.layers[:-15]:
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
print("Phase 2: Careful fine-tuning")
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