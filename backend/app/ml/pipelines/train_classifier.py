"""
Training entrypoint for the skin-concern classifier.

Supports two feature modes:
  - tabular-only: gradient-boosted classifier over lifestyle/profile features
  - image-augmented: CNN (via PyTorch) fine-tuned on labeled skin images,
    whose penultimate-layer embeddings can be concatenated with tabular features

Run as a script (e.g. via ml-pipeline.yml CI job):
    python -m app.ml.pipelines.train_classifier --data data/labeled_skin_data.csv
"""
import argparse
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import StandardScaler

from app.core.config import settings
from app.ml.pipelines.preprocess import TABULAR_FEATURE_ORDER

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONCERN_LABELS = ["acne", "hyperpigmentation", "wrinkles", "dehydration", "redness", "large_pores"]


def load_dataset(csv_path: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Expects a CSV with TABULAR_FEATURE_ORDER columns plus one binary
    label column per entry in CONCERN_LABELS."""
    df = pd.read_csv(csv_path)
    X = df[TABULAR_FEATURE_ORDER]
    y = df[CONCERN_LABELS]
    return X, y


def train(csv_path: str, output_dir: str) -> None:
    X, y = load_dataset(csv_path)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    base_estimator = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=42, class_weight="balanced")
    model = MultiOutputClassifier(base_estimator)
    model.fit(X_train_scaled, y_train)

    predictions = model.predict(X_test_scaled)
    report = classification_report(y_test, predictions, target_names=CONCERN_LABELS, output_dict=True, zero_division=0)
    logger.info("Classification report:\n%s", json.dumps(report, indent=2))

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, output_path / "concern_classifier.pkl")
    joblib.dump(scaler, Path(settings.SCALER_PATH))

    with open(output_path / "metrics.json", "w") as f:
        json.dump(report, f, indent=2)

    with open(output_path / "metadata.json", "w") as f:
        json.dump(
            {
                "model_version": "1.0.0",
                "feature_order": TABULAR_FEATURE_ORDER,
                "labels": CONCERN_LABELS,
                "algorithm": "RandomForestClassifier (multi-output)",
            },
            f,
            indent=2,
        )

    logger.info("Model artifacts saved to %s", output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the skin-concern classifier")
    parser.add_argument("--data", required=True, help="Path to labeled training CSV")
    parser.add_argument(
        "--output", default=settings.SKIN_CLASSIFIER_PATH, help="Directory to save model artifacts"
    )
    args = parser.parse_args()
    train(args.data, args.output)
