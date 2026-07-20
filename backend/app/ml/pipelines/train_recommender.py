"""
Training entrypoint for the product recommendation model.

Uses a LightGBM ranker over (user_features, product_features) pairs, trained
on implicit feedback (routine adoption, repurchase, positive progress deltas
after use) to predict a suitability/ranking score per product per user profile.

Run as a script (e.g. via ml-pipeline.yml CI job):
    python -m app.ml.pipelines.train_recommender --interactions data/interactions.csv --catalog app/ml/dataset/product_catalog.json
"""
import argparse
import json
import logging
from pathlib import Path

import joblib
import lightgbm as lgb
import pandas as pd
from sklearn.metrics import ndcg_score
from sklearn.model_selection import train_test_split

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Interaction CSV expected columns:
# user_skin_type, user_primary_concern, product_id, product_category,
# product_targets_concern (0/1 match flag), price_tier, label (implicit feedback score 0-1)
FEATURE_COLUMNS = [
    "user_skin_type_encoded",
    "user_primary_concern_encoded",
    "product_category_encoded",
    "product_targets_concern",
    "price_tier_encoded",
]


def _encode_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col, source in [
        ("user_skin_type_encoded", "user_skin_type"),
        ("user_primary_concern_encoded", "user_primary_concern"),
        ("product_category_encoded", "product_category"),
        ("price_tier_encoded", "price_tier"),
    ]:
        df[col] = df[source].astype("category").cat.codes
    return df


def train(interactions_csv: str, output_dir: str) -> None:
    df = pd.read_csv(interactions_csv)
    df = _encode_categoricals(df)

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    train_data = lgb.Dataset(X_train, label=y_train)
    test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

    params = {
        "objective": "regression",
        "metric": "rmse",
        "learning_rate": 0.05,
        "num_leaves": 31,
        "verbose": -1,
    }

    model = lgb.train(
        params,
        train_data,
        num_boost_round=200,
        valid_sets=[test_data],
        callbacks=[lgb.early_stopping(stopping_rounds=15), lgb.log_evaluation(period=25)],
    )

    predictions = model.predict(X_test, num_iteration=model.best_iteration)
    try:
        score = ndcg_score([y_test.values], [predictions])
    except ValueError:
        # ndcg_score requires >1 relevance level per query group; fall back gracefully
        score = None

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, output_path / "recommender_model.pkl")

    with open(output_path / "metadata.json", "w") as f:
        json.dump(
            {
                "model_version": "1.0.0",
                "feature_columns": FEATURE_COLUMNS,
                "algorithm": "LightGBM regression ranker",
                "ndcg_score": score,
                "best_iteration": model.best_iteration,
            },
            f,
            indent=2,
        )

    logger.info("Recommender artifacts saved to %s (ndcg=%s)", output_path, score)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the product recommendation model")
    parser.add_argument("--interactions", required=True, help="Path to interactions CSV")
    parser.add_argument("--catalog", default=settings.PRODUCT_CATALOG_PATH, help="Path to product catalog JSON")
    parser.add_argument("--output", default=settings.RECOMMENDER_PATH, help="Directory to save model artifacts")
    args = parser.parse_args()
    train(args.interactions, args.output)
