# ==============================================================================
# backend/prediction/predictor.py
# ==============================================================================

import torch
from torchvision import models

from backend.config import MODEL_PATH, DEVICE, TOP_K
from backend.prediction.labels import CLASS_NAMES
from backend.prediction.preprocessing import preprocess_image


class SkinPredictor:
    """
    Loads the trained MobileNetV2 model once and performs inference.
    """

    def __init__(self):
        self.model = self._load_model()

    def _load_model(self):
        """
        Load the fine-tuned MobileNetV2 model.
        """

        model = models.mobilenet_v2(weights=None)

        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(0.2),
            torch.nn.Linear(1280, len(CLASS_NAMES))
        )

        model.load_state_dict(
            torch.load(
                MODEL_PATH,
                map_location=DEVICE
            )
        )

        model.to(DEVICE)
        model.eval()

        return model

    def predict(self, image_path):
        """
        Predict the Top-K skin concerns for an input image.

        Args:
            image_path (str | Path)

        Returns:
            dict
        """

        image_tensor = preprocess_image(image_path).to(DEVICE)

        with torch.no_grad():

            outputs = self.model(image_tensor)

            probabilities = torch.softmax(outputs, dim=1)

            top_probabilities, top_indices = torch.topk(
                probabilities,
                k=TOP_K
            )

        predictions = []

        for probability, index in zip(
            top_probabilities[0],
            top_indices[0]
        ):

            predictions.append({
                "label": CLASS_NAMES[index.item()],
                "confidence": round(probability.item() * 100, 2)
            })

        return {
            "top_prediction": predictions[0],
            "predictions": predictions
        }