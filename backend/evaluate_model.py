import tensorflow as tf
from pathlib import Path

# -------------------------
# Paths
# -------------------------

MODEL_PATH = Path("models/skin_classifier.keras")
DATASET_PATH = Path("datasets/raw/mentor_dataset")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# -------------------------
# Load Validation Dataset
# -------------------------

val_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = val_dataset.class_names

print("\nClasses:")
print(class_names)

# -------------------------
# Load Model
# -------------------------

print("\nLoading Model...")

model = tf.keras.models.load_model(MODEL_PATH)

# -------------------------
# Compile Model
# -------------------------

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# -------------------------
# Evaluate
# -------------------------

print("\nEvaluating Model...\n")

loss, accuracy = model.evaluate(val_dataset)

print("\n==============================")
print("MODEL EVALUATION")
print("==============================")

print(f"Loss      : {loss:.4f}")
print(f"Accuracy  : {accuracy*100:.2f}%")
print(f"Classes   : {class_names}")
print("==============================")