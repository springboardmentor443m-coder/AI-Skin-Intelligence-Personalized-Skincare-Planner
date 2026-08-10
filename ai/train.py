import os
import argparse
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from sklearn.metrics import classification_report, confusion_matrix
from preprocess import get_data_generators

def build_model(model_name="mobilenetv2", num_classes=3):
    """
    Builds the Transfer Learning model using pre-trained bases.
    """
    input_shape = (224, 224, 3)
    
    if model_name.lower() == "efficientnetb0":
        print("Using EfficientNetB0 as the pre-trained base...")
        base_model = tf.keras.applications.EfficientNetB0(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape
        )
    else:
        print("Using MobileNetV2 as the pre-trained base...")
        base_model = tf.keras.applications.MobileNetV2(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape
        )
        
    # Freeze the pre-trained base model
    base_model.trainable = False
    
    # Construct the classification head
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def train_model(epochs=10, model_type="mobilenetv2"):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    model_path = os.path.join(base_dir, "skin_type_model.h5")
    
    print("-------------------------------------------------")
    print(f"TensorFlow Version: {tf.__version__}")
    gpus = tf.config.list_physical_devices('GPU')
    print(f"GPUs available: {len(gpus)}")
    print("-------------------------------------------------")
    
    # 1. Load Data Generators
    train_gen, val_gen = get_data_generators(data_dir)
    num_classes = train_gen.num_classes
    class_indices = train_gen.class_indices
    class_labels = list(class_indices.keys())
    
    # Save the label mapping to a text file for prediction mapping later
    labels_path = os.path.join(base_dir, "classes.txt")
    with open(labels_path, "w") as f:
        f.write("\n".join(class_labels))
        
    print(f"Detected Classes: {class_labels}")
    
    # 2. Build Model
    model = build_model(model_type, num_classes)
    
    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    model.summary()
    
    # 3. Setup Callbacks
    checkpoint = ModelCheckpoint(
        model_path,
        monitor="val_loss",
        save_best_only=True,
        mode="min",
        verbose=1
    )
    
    early_stopping = EarlyStopping(
        monitor="val_loss",
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
    
    # 4. Fit Model
    print(f"Starting training for {epochs} epochs...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        callbacks=[checkpoint, early_stopping],
        verbose=1
    )
    
    # 5. Save final model if checkpoint didn't trigger
    if not os.path.exists(model_path):
        model.save(model_path)
        print(f"Saved fallback model to {model_path}")
        
    # 6. Evaluation & Analytics
    print("\n--- Running Final Evaluation ---")
    val_loss, val_acc = model.evaluate(val_gen, verbose=0)
    print(f"Validation Loss: {val_loss:.4f}")
    print(f"Validation Accuracy: {val_acc:.4f}")
    
    # Predict on validation data to calculate classification metrics
    val_gen.reset()
    predictions = model.predict(val_gen)
    y_pred = np.argmax(predictions, axis=1)
    y_true = val_gen.classes
    
    print("\n--- Classification Report ---")
    print(classification_report(y_true, y_pred, target_names=class_labels, zero_division=0))
    
    # 7. Plot Metrics History
    plot_path = os.path.join(base_dir, "training_history.png")
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.title('Accuracy curves')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Loss curves')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(plot_path)
    print(f"Saved training history curves to {plot_path}")
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CNN model on skin data")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--model", type=str, default="mobilenetv2", choices=["mobilenetv2", "efficientnetb0"], help="Base CNN Model architecture")
    args = parser.parse_args()
    
    train_model(epochs=args.epochs, model_type=args.model)
