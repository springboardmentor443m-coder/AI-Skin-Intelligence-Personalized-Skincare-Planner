"""
Trains a skin-type classifier (dry / normal / oily) using transfer learning
on MobileNetV2. VERSION 2 — fixes overfitting seen in v1, adds class
weighting, and a careful fine-tuning phase.
"""

import os
import tensorflow as tf
from tensorflow.keras import layers

DATA_DIR = "datasets/skin-types/Oily-Dry-Skin-Types"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 25
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
print("Class weights (higher = model penalized more for getting this class wrong):")
for idx, name in enumerate(class_names):
    print(f"  {name}: {class_weight[idx]:.3f}")
print()

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.1),
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
x = layers.Dropout(0.5)(x)
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

print("=" * 60)
print("Phase 1: Training top layers (base model frozen)")
print("=" * 60)
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=[early_stop, reduce_lr],
    class_weight=class_weight,
)

model.save(MODEL_OUT)

best_val_acc = max(history.history["val_accuracy"])
print("\n" + "=" * 60)
print(f"Phase 1 done. Best validation accuracy: {best_val_acc:.2%}")
print("=" * 60)

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
    epochs=10,
    callbacks=[finetune_early_stop],
    class_weight=class_weight,
)

model.save(MODEL_OUT)

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