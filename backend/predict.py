import os

import numpy as np
import tensorflow as tf
from PIL import Image

# Path to the trained TensorFlow model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "skin_disease_model.keras")

# Class names for the trained model
CLASS_NAMES = [
    "Normal",
    "Acne",
    "Wrinkles",
    "Eczema",
    "Rosacea",
    "Dark Spots",
]

# Load the model once when the module is imported
model = tf.keras.models.load_model(MODEL_PATH)


def predict_image(image_path: str):
    """Predict the disease class for an image located at image_path."""
    # Open and preprocess the image
    image = Image.open(image_path).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = image_array / 255.0

    # Run prediction
    predictions = model.predict(image_array, verbose=0)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index] * 100)

    return {
        "disease": CLASS_NAMES[predicted_index],
        "confidence": round(confidence, 2),
    }
