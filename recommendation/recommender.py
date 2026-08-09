
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "processed_products.parquet"
MODEL_DIR = BASE_DIR / "models"

VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"
MATRIX_PATH = MODEL_DIR / "product_tfidf_matrix.pkl"


class RecommendationEngine:
    """Content-based skincare recommendation engine."""

    # User-language terms -> dataset product categories
    CATEGORY_KEYWORDS = {
        "moisturizer": {
            "moisturizers",
            "night cream",
            "face oil",
            "mists",
            "essences",
        },
        "moisturizers": {
            "moisturizers",
            "night cream",
            "face oil",
            "mists",
            "essences",
        },
        "cream": {
            "moisturizers",
            "night cream",
        },
        "serum": {
            "treatments",
            "face serums",
        },
        "serums": {
            "treatments",
            "face serums",
        },
        "cleanser": {
            "cleansers",
            "face wash & cleansers",
        },
        "cleansers": {
            "cleansers",
            "face wash & cleansers",
        },
        "face wash": {
            "cleansers",
            "face wash & cleansers",
        },
        "toner": {
            "cleansers",
            "toners",
        },
        "toners": {
            "cleansers",
            "toners",
        },
        "sunscreen": {
            "sunscreen",
            "face sunscreen",
        },
        "spf": {
            "sunscreen",
            "face sunscreen",
        },
        "mask": {
            "masks",
            "face masks",
            "sheet masks",
        },
        "masks": {
            "masks",
            "face masks",
            "sheet masks",
        },
        "eye cream": {
            "eye care",
            "eye creams & treatments",
        },
        "eye care": {
            "eye care",
            "eye creams & treatments",
        },
        "acne treatment": {
            "treatments",
            "blemish & acne treatments",
        },
        "acne": {
            "treatments",
            "blemish & acne treatments",
        },
        "dark spots": {
            "treatments",
            "face serums",
        },
        "pigmentation": {
            "treatments",
            "face serums",
        },
    }

    def __init__(
        self,
        vectorizer_path: Path = VECTORIZER_PATH,
        matrix_path: Path = MATRIX_PATH,
        dataset_path: Path = DATASET_PATH,
    ) -> None:

        self.vectorizer_path = vectorizer_path
        self.matrix_path = matrix_path
        self.dataset_path = dataset_path

        self.vectorizer: Any = None
        self.tfidf_matrix: Any = None
        self.products: pd.DataFrame | None = None

    def load_models(self) -> None:
        """Load trained TF-IDF artifacts and product data."""

        if not self.vectorizer_path.exists():
            raise FileNotFoundError(
                f"Vectorizer not found: {self.vectorizer_path}"
            )

        if not self.matrix_path.exists():
            raise FileNotFoundError(
                f"TF-IDF matrix not found: {self.matrix_path}"
            )

        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Product dataset not found: {self.dataset_path}"
            )

        self.vectorizer = joblib.load(self.vectorizer_path)
        self.tfidf_matrix = joblib.load(self.matrix_path)
        self.products = pd.read_parquet(self.dataset_path)

    def build_query(self, query_text: str):
        """Convert user query into the TF-IDF representation."""

        if self.vectorizer is None:
            raise RuntimeError(
                "Models are not loaded. Call load_models() first."
            )

        query_text = str(query_text).strip()

        if not query_text:
            raise ValueError("Query text cannot be empty.")

        return self.vectorizer.transform([query_text.lower()])

    def detect_categories(self, query_text: str) -> set[str]:
        """Detect product categories requested by the user."""

        query = query_text.lower().strip()
        detected_categories: set[str] = set()

        for keyword, categories in self.CATEGORY_KEYWORDS.items():
            if keyword in query:
                detected_categories.update(categories)

        return detected_categories

    @staticmethod
    def category_match_score(
        product: pd.Series,
        requested_categories: set[str],
    ) -> float:
        """
        Calculate category relevance.

        Returns:
            1.0  -> strong category match
            0.5  -> partial match
            0.0  -> no category match
            -1.0 -> clearly mismatched product type
        """

        if not requested_categories:
            return 0.0

        secondary = str(
            product.get("secondary_category", "")
        ).strip().lower()

        tertiary = str(
            product.get("tertiary_category", "")
        ).strip().lower()

        product_categories = {secondary, tertiary}

        if product_categories & requested_categories:
            return 1.0

        # For some broader categories, allow a partial match.
        for category in requested_categories:

            if category in secondary or category in tertiary:
                return 0.5

        return -1.0

    @staticmethod
    def quality_score(product: pd.Series) -> float:
        """
        Calculate a small quality/popularity contribution.

        This deliberately remains a secondary signal so that
        popularity does not overpower relevance.
        """

        rating = product.get("rating")
        reviews = product.get("reviews")

        if pd.isna(rating):
            rating_score = 0.0
        else:
            rating_score = min(float(rating) / 5.0, 1.0)

        if pd.isna(reviews):
            review_score = 0.0
        else:
            # Log scaling prevents products with thousands of reviews
            # from completely dominating the ranking.
            import math

            review_score = min(
                math.log1p(float(reviews)) / math.log1p(10000),
                1.0,
            )

        return (
            0.7 * rating_score
            + 0.3 * review_score
        )

    def recommend_products(
        self,
        query_text: str,
        top_k: int = 10,
    ) -> list[dict[str, Any]]:
        """Return ranked skincare products for a user query."""

        if self.products is None or self.tfidf_matrix is None:
            raise RuntimeError(
                "Models are not loaded. Call load_models() first."
            )

        query_vector = self.build_query(query_text)

        similarity_scores = cosine_similarity(
            query_vector,
            self.tfidf_matrix,
        ).flatten()

        requested_categories = self.detect_categories(query_text)

        ranked_candidates = []

        for index, similarity in enumerate(similarity_scores):

            product = self.products.iloc[index]

            # Ignore unavailable products.
            if bool(product.get("out_of_stock", False)):
                continue

            similarity_score = float(similarity)

            # Ignore completely unrelated products.
            if similarity_score <= 0:
                continue

            category_score = self.category_match_score(
                product,
                requested_categories,
            )

            quality_score = self.quality_score(product)

            # Main relevance signal.
            final_score = similarity_score

            # Category relevance is important but should not completely
            # replace semantic similarity.
            if requested_categories:

                if category_score == 1.0:
                    final_score += 0.20

                elif category_score == 0.5:
                    final_score += 0.08

                elif category_score == -1.0:
                    final_score -= 0.15

            # Small quality contribution.
            final_score += 0.05 * quality_score

            ranked_candidates.append(
                (
                    final_score,
                    similarity_score,
                    product,
                    category_score,
                    quality_score,
                )
            )

        ranked_candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        recommendations = []

        for (
            final_score,
            similarity_score,
            product,
            category_score,
            quality_score,
        ) in ranked_candidates[:top_k]:

            recommendations.append(
                {
                    "product_id": product["product_id"],
                    "product_name": product["product_name"],
                    "brand_name": product["brand_name"],
                    "category": product["secondary_category"],
                    "subcategory": product["tertiary_category"],
                    "rating": (
                        float(product["rating"])
                        if pd.notna(product["rating"])
                        else None
                    ),
                    "reviews": (
                        int(product["reviews"])
                        if pd.notna(product["reviews"])
                        else 0
                    ),
                    "price_usd": (
                        float(product["price_usd"])
                        if pd.notna(product["price_usd"])
                        else None
                    ),
                    "similarity_score": round(
                        similarity_score,
                        4,
                    ),
                    "recommendation_score": round(
                        final_score,
                        4,
                    ),
                }
            )

        return recommendations


def main() -> None:

    print("=" * 60)
    print("SKINCARE RECOMMENDATION TEST")
    print("=" * 60)

    engine = RecommendationEngine()

    print("Loading recommendation model...")
    engine.load_models()

    print("Model loaded successfully.")
    print()

    query = input(
        "Enter skincare requirement "
        "(example: acne oily skin): "
    ).strip()

    results = engine.recommend_products(
        query_text=query,
        top_k=10,
    )

    print()
    print("=" * 60)
    print("TOP RECOMMENDATIONS")
    print("=" * 60)

    for rank, product in enumerate(results, start=1):

        print(f"\n#{rank}")
        print(f"Product     : {product['product_name']}")
        print(f"Brand       : {product['brand_name']}")
        print(f"Category    : {product['category']}")
        print(f"Subcategory : {product['subcategory']}")
        print(f"Rating      : {product['rating']}")
        print(f"Reviews     : {product['reviews']}")
        print(f"Price       : ${product['price_usd']}")
        print(
            f"Similarity  : "
            f"{product['similarity_score']}"
        )
        print(
            f"Final Score : "
            f"{product['recommendation_score']}"
        )


if __name__ == "__main__":
    main()