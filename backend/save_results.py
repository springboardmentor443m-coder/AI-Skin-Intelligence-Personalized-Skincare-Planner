import json
import os
from datetime import datetime


def save_prediction(
        prediction,
        confidence,
        probabilities,
        user="default_user"
):

    folder = os.path.join("results", user)

    os.makedirs(folder, exist_ok=True)

    filename = datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".json"

    filepath = os.path.join(folder, filename)

    data = {

        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),

        "prediction": prediction,

        "confidence": float(confidence),

        "probabilities": probabilities

    }

    with open(filepath, "w") as f:
        json.dump(data, f, indent=4)

    print(f"\nPrediction saved to:\n{filepath}")

    return filepath