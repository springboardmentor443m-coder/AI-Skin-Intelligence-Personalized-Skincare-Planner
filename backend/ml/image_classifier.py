import os
import numpy as np
import tensorflow as tf

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


BASE_DIR = os.path.dirname(__file__)

model = load_model(
    os.path.join(BASE_DIR, "saved_models", "skin_classifier.keras")
)

CLASS_NAMES = [
    "clear skin",
    "dark spots",
    "puffy eyes",
    "wrinkles"
]


def predict_skin_condition(image_path):

    img = image.load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = image.img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)

    predicted_index = np.argmax(prediction)

    confidence = float(np.max(prediction))

    return {
        "prediction": CLASS_NAMES[predicted_index],
        "confidence": round(confidence * 100, 2)
    }