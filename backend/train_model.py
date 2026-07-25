import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from pathlib import Path

# Dataset Path
DATASET_PATH = Path("datasets/raw/mentor_dataset")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

train_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

validation_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

print("\nClasses:")
print(train_dataset.class_names)

# -------------------------------------------------------
# Build CNN Model
# -------------------------------------------------------

model = keras.Sequential([

    # Normalize pixel values (0-255 -> 0-1)
    layers.Rescaling(1./255),

    # First Convolution Block
    layers.Conv2D(32, (3,3), activation='relu'),
    layers.MaxPooling2D(),

    # Second Convolution Block
    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D(),

    # Third Convolution Block
    layers.Conv2D(128, (3,3), activation='relu'),
    layers.MaxPooling2D(),

    # Flatten
    layers.Flatten(),

    # Fully Connected Layer
    layers.Dense(128, activation='relu'),

    # Prevent Overfitting
    layers.Dropout(0.3),

    # Output Layer
    layers.Dense(4, activation='softmax')
])

# -------------------------------------------------------
# Compile Model
# -------------------------------------------------------

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("\n")
print("="*60)
print("CNN MODEL SUMMARY")
print("="*60)

model.build((None, 224, 224, 3))
model.summary()

print("\nCompiling Model...")

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

print("\nStarting Training...\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=10
)

from pathlib import Path

Path("models").mkdir(exist_ok=True)

model.save("models/skin_classifier.keras")
print("\nModel Saved Successfully!")

import matplotlib.pyplot as plt

Path("outputs").mkdir(exist_ok=True)

plt.figure(figsize=(8,5))

plt.plot(history.history["accuracy"], label="Training Accuracy")
plt.plot(history.history["val_accuracy"], label="Validation Accuracy")

plt.title("Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()

plt.savefig("outputs/training_accuracy.png")
plt.close()

plt.figure(figsize=(8,5))

plt.plot(history.history["loss"], label="Training Loss")
plt.plot(history.history["val_loss"], label="Validation Loss")

plt.title("Model Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()

plt.savefig("outputs/training_loss.png")
plt.close()

print("Graphs Saved!")