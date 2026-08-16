import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras import layers
import matplotlib.pyplot as plt

# Set paths
DATASET_DIR = "Skin Type Identification Research"
TRAIN_DIR = os.path.join(DATASET_DIR, "Train")
VAL_DIR = os.path.join(DATASET_DIR, "Validation")
TEST_DIR = os.path.join(DATASET_DIR, "Test")

IMG_SIZE = (128, 128)
BATCH_SIZE = 32

print("Loading datasets...")
train_ds = keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    labels="inferred",
    label_mode="int",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_ds = keras.utils.image_dataset_from_directory(
    VAL_DIR,
    labels="inferred",
    label_mode="int",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_ds = keras.utils.image_dataset_from_directory(
    TEST_DIR,
    labels="inferred",
    label_mode="int",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_ds.class_names
print(f"Class names found: {class_names}")

# Data augmentation for training to prevent overfitting
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.1),
])

# Normalize/Rescale layer
rescaling = layers.Rescaling(1./255)

# Preprocessing datasets
def preprocess(ds, augment=False):
    ds = ds.map(lambda x, y: (rescaling(x), y), num_parallel_calls=tf.data.AUTOTUNE)
    if augment:
        ds = ds.map(lambda x, y: (data_augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    return ds.prefetch(buffer_size=tf.data.AUTOTUNE)

train_ds_pre = preprocess(train_ds, augment=True)
val_ds_pre = preprocess(val_ds, augment=False)
test_ds_pre = preprocess(test_ds, augment=False)

# Build Model: Custom CNN model for high-accuracy skin classification
print("Building custom CNN skin classifier model...")
model = keras.Sequential([
    layers.Input(shape=(128, 128, 3)),
    
    layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Dropout(0.25),
    
    layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Dropout(0.25),
    
    layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Dropout(0.25),
    
    layers.Flatten(),
    layers.Dense(256, activation="relu"),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(len(class_names), activation="softmax")
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# Train Model
EPOCHS = 8
print(f"Starting training for {EPOCHS} epochs...")
history = model.fit(
    train_ds_pre,
    validation_data=val_ds_pre,
    epochs=EPOCHS
)

# Evaluate on Test Set
print("\nEvaluating on Test Set...")
test_loss, test_acc = model.evaluate(test_ds_pre)
print(f"Test Accuracy: {test_acc:.4f}")

# Retrieve predictions and true labels for reporting
all_images = []
all_labels = []
for imgs, labels in test_ds_pre:
    all_images.append(imgs)
    all_labels.append(labels)

x_test = np.concatenate(all_images, axis=0)
y_test = np.concatenate(all_labels, axis=0)

y_pred_probs = model.predict(x_test)
y_pred = np.argmax(y_pred_probs, axis=1)

# Metrics Reports (NumPy implementation)
print("\nClassification Report (NumPy):")
cm = np.zeros((len(class_names), len(class_names)), dtype=int)
for t, p in zip(y_test, y_pred):
    cm[t, p] += 1

print(f"{'Class':<15} {'Precision':<10} {'Recall':<10} {'F1-Score':<10}")
print("-" * 50)
for i, name in enumerate(class_names):
    tp = cm[i, i]
    fp = np.sum(cm[:, i]) - tp
    fn = np.sum(cm[i, :]) - tp
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    print(f"{name:<15} {precision:<10.4f} {recall:<10.4f} {f1:<10.4f}")

# Save Confusion Matrix plot (Matplotlib only)
plt.figure(figsize=(8, 6))
plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
plt.title("Confusion Matrix - Skin Type Identification")
plt.colorbar()
tick_marks = np.arange(len(class_names))
plt.xticks(tick_marks, class_names, rotation=45)
plt.yticks(tick_marks, class_names)
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, format(cm[i, j], 'd'),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")
plt.ylabel('True Class')
plt.xlabel('Predicted Class')
plt.tight_layout()
os.makedirs("artifacts", exist_ok=True)
plt.savefig("artifacts/confusion_matrix.png")
print("Confusion matrix saved to artifacts/confusion_matrix.png")

# Save History plots
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history["accuracy"], label="train_accuracy")
plt.plot(history.history["val_accuracy"], label="val_accuracy")
plt.title("Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history["loss"], label="train_loss")
plt.plot(history.history["val_loss"], label="val_loss")
plt.title("Model Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.tight_layout()
plt.savefig("artifacts/training_history.png")
print("Training curves saved to artifacts/training_history.png")

# Save model
model.save("skin_type_model.keras")
print("Model saved to skin_type_model.keras")
