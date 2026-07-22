from pathlib import Path
import tensorflow as tf

# Dataset path
DATASET_PATH = Path("datasets/processed")

# Parameters
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.2
SEED = 42

print("=" * 60)
print("Loading Dataset")
print("=" * 60)

# Training Dataset
train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

# Validation Dataset
validation_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

print("\nClass Names:")
print(train_dataset.class_names)

print("\nTraining Batches:", len(train_dataset))
print("Validation Batches:", len(validation_dataset))

print("\nDataset Loader Ready!")