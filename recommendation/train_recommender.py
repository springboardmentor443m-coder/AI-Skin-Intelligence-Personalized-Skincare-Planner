from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "processed_products.parquet"
MODEL_DIR = BASE_DIR / "models"

VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"
MATRIX_PATH = MODEL_DIR / "product_tfidf_matrix.pkl"


def load_processed_dataset() -> pd.DataFrame:
    """Load the processed skincare product dataset."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Processed dataset not found: {DATASET_PATH}"
        )

    df = pd.read_parquet(DATASET_PATH)

    if "search_text" not in df.columns:
        raise ValueError(
            "Dataset must contain a 'search_text' column."
        )

    return df


def train_vectorizer(
    search_text: pd.Series,
) -> tuple[TfidfVectorizer, Any]:
    """Train TF-IDF on product search text."""

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
    )

    tfidf_matrix = vectorizer.fit_transform(search_text)

    return vectorizer, tfidf_matrix


def save_artifacts(
    vectorizer: TfidfVectorizer,
    tfidf_matrix: Any,
) -> None:
    """Save trained recommendation artifacts."""

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(tfidf_matrix, MATRIX_PATH)

    print(f"Vectorizer saved to: {VECTORIZER_PATH}")
    print(f"TF-IDF matrix saved to: {MATRIX_PATH}")


def main() -> None:
    print("=" * 60)
    print("SKINCARE RECOMMENDER TRAINING")
    print("=" * 60)

    df = load_processed_dataset()

    print(f"Products loaded: {len(df)}")

    vectorizer, tfidf_matrix = train_vectorizer(
        df["search_text"].fillna("")
    )

    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

    save_artifacts(vectorizer, tfidf_matrix)

    print("=" * 60)
    print("TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    main()