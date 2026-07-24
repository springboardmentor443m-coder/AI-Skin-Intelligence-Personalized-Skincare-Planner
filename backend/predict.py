from pathlib import Path
import tensorflow as tf
import numpy as np
import json

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "skin_classifier.keras"

OUTPUT_PATH = Path("outputs")
OUTPUT_PATH.mkdir(exist_ok=True)

model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    "clear face",
    "darkspots",
    "puffy eyes",
    "wrinkles"
]

IMG_SIZE = (224, 224)

def predict_image(image_path):

    image = tf.keras.preprocessing.image.load_img(
        image_path,
        target_size=IMG_SIZE
    )

    image_array = tf.keras.preprocessing.image.img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(image_array, verbose=0)

    probabilities = prediction[0]

    predicted_index = np.argmax(probabilities)

    predicted_class = CLASS_NAMES[predicted_index]

    confidence = probabilities[predicted_index] * 100

    print("\n==============================")
    print("SKIN ANALYSIS REPORT")
    print("==============================")

    print(f"\nPredicted Concern : {predicted_class}")
    print(f"Confidence        : {confidence:.2f}%")

    print("\nAll Probabilities")
    print("------------------------------")

    for cls, prob in zip(CLASS_NAMES, probabilities):
        print(f"{cls:<15} : {prob*100:.2f}%")

    return {
    "predicted_class": predicted_class,
    "confidence": float(confidence),
    "probabilities": {
        cls: float(prob * 100)
        for cls, prob in zip(CLASS_NAMES, probabilities)
    }
}

if __name__ == "__main__":

    image_path = input("Enter image path: ")

    week = input("Enter week number : ")

    result = predict_image(image_path)

    import json
    from pathlib import Path

    Path("outputs").mkdir(exist_ok=True)

    output_file = Path(f"outputs/week{week}_prediction.json")

    with open(output_file, "w") as file:
        json.dump(result, file, indent=4)

    print(f"\nPrediction saved to {output_file}")