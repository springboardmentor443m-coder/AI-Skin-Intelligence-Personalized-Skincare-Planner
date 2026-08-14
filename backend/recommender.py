# ============================================================
# AI SKIN INTELLIGENCE
# PERSONALIZED SKINCARE PRODUCT RECOMMENDER
# ============================================================
#
# Purpose:
#   This module dynamically recommends skincare products from
#   the Sephora-based skincare_products.csv dataset.
#
# Recommendation approach:
#   1. Filter products according to detected skin concern
#   2. Include suitable skin-type information
#   3. Build text features from concern, skin type and
#      ingredients
#   4. Convert text into TF-IDF vectors
#   5. Calculate Cosine Similarity
#   6. Rank products according to similarity
#   7. Return the Top-N products
#
# IMPORTANT:
#   Products are NOT hard-coded in this file.
#   Recommendations come dynamically from the CSV dataset.
# ============================================================


# ============================================================
# 1. IMPORT REQUIRED LIBRARIES
# ============================================================

import os

import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# 2. DATASET PATH
# ============================================================
#
# Project structure:
#
# backend/
# ├── data/
# │   └── skincare_products.csv
# ├── models/
# │   └── facial_skin_model.keras
# └── recommender.py
#
# __file__ refers to this recommender.py file.
# Therefore the CSV path works correctly even when FastAPI
# is started from the main project directory.
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CSV_PATH = os.path.join(
    BASE_DIR,
    "data",
    "skincare_products.csv"
)


# ============================================================
# 3. SKINCARE RECOMMENDER CLASS
# ============================================================

class SkincareRecommender:

    # --------------------------------------------------------
    # INITIALIZE RECOMMENDER
    # --------------------------------------------------------

    def __init__(
        self,
        csv_path: str = CSV_PATH
    ):

        self.df = pd.DataFrame()

        self.is_ready = False

        self.csv_path = csv_path

        # ----------------------------------------------------
        # CHECK DATASET
        # ----------------------------------------------------

        if not os.path.exists(
            self.csv_path
        ):

            print(
                "WARNING: Skincare product dataset "
                "not found."
            )

            print(
                f"Expected location: {self.csv_path}"
            )

            return

        # ----------------------------------------------------
        # LOAD DATASET
        # ----------------------------------------------------

        try:

            self.df = pd.read_csv(
                self.csv_path
            )

            # -----------------------------------------------
            # VALIDATE REQUIRED COLUMNS
            # -----------------------------------------------

            required_columns = {
                "product_id",
                "brand",
                "name",
                "price",
                "rating",
                "skin_type",
                "concern",
                "ingredients",
            }

            missing_columns = (
                required_columns
                - set(self.df.columns)
            )

            if missing_columns:

                print(
                    "WARNING: Skincare dataset is "
                    "missing required columns:"
                )

                print(
                    sorted(
                        missing_columns
                    )
                )

                return

            # -----------------------------------------------
            # REMOVE COMPLETELY EMPTY ROWS
            # -----------------------------------------------

            self.df = self.df.dropna(
                how="all"
            ).copy()

            # -----------------------------------------------
            # CLEAN IMPORTANT TEXT COLUMNS
            # -----------------------------------------------

            text_columns = [
                "brand",
                "name",
                "skin_type",
                "concern",
                "ingredients",
            ]

            for column in text_columns:

                self.df[column] = (
                    self.df[column]
                    .fillna("")
                    .astype(str)
                    .str.strip()
                )

            # -----------------------------------------------
            # RECOMMENDER READY
            # -----------------------------------------------

            if self.df.empty:

                print(
                    "WARNING: Skincare dataset "
                    "contains no usable products."
                )

                return

            self.is_ready = True

            print(
                "================================================"
            )

            print(
                "Skincare Product Recommendation Engine "
                "initialized successfully!"
            )

            print(
                f"Dataset: {self.csv_path}"
            )

            print(
                f"Products loaded: {len(self.df)}"
            )

            print(
                "Recommendation method: "
                "TF-IDF + Cosine Similarity"
            )

            print(
                "================================================"
            )

        except Exception as e:

            print(
                "WARNING: Error loading skincare "
                f"dataset: {e}"
            )

            self.is_ready = False


    # ========================================================
    # 4. NORMALIZE TEXT
    # ========================================================

    @staticmethod
    def _normalize_text(
        value
    ) -> str:

        if value is None:

            return ""

        return (
            str(value)
            .strip()
            .lower()
        )


    # ========================================================
    # 5. GET TOP PRODUCT RECOMMENDATIONS
    # ========================================================

    def get_top_recommendations(
        self,
        skin_concern: str,
        skin_type: str = "all",
        top_n: int = 5
    ) -> list:

        # ----------------------------------------------------
        # BASIC VALIDATION
        # ----------------------------------------------------

        if (
            not self.is_ready
            or self.df.empty
        ):

            print(
                "Recommendation engine is not ready."
            )

            return []

        if not skin_concern:

            return []

        # ----------------------------------------------------
        # NORMALIZE INPUT
        # ----------------------------------------------------

        target_concern = (
            self._normalize_text(
                skin_concern
            )
        )

        target_skin_type = (
            self._normalize_text(
                skin_type
            )
        )

        # ----------------------------------------------------
        # MAKE SURE top_n IS VALID
        # ----------------------------------------------------

        try:

            top_n = int(top_n)

        except Exception:

            top_n = 5

        if top_n <= 0:

            top_n = 5


        # ====================================================
        # STEP 1 — FILTER BY DETECTED SKIN CONCERN
        # ====================================================
        #
        # Example:
        #
        # Model detects:
        #   acne
        #
        # The recommender first searches for products whose
        # dataset concern is "acne".
        # ====================================================

        concern_series = (
            self.df["concern"]
            .astype(str)
            .str.strip()
            .str.lower()
        )

        filtered_df = self.df[
            concern_series == target_concern
        ].copy()


        # ====================================================
        # STEP 2 — FALLBACK IF NOT ENOUGH PRODUCTS
        # ====================================================
        #
        # If fewer than top_n products are available for the
        # detected concern, include "clear skin" products as
        # additional candidates.
        #
        # This prevents the application from returning fewer
        # recommendations when the dataset has limited products
        # for a particular concern.
        # ====================================================

        if len(filtered_df) < top_n:

            fallback_mask = (
                concern_series.isin(
                    [
                        target_concern,
                        "clear skin",
                    ]
                )
            )

            fallback_df = self.df[
                fallback_mask
            ].copy()

            if not fallback_df.empty:

                filtered_df = fallback_df

        # ----------------------------------------------------
        # FINAL FALLBACK
        # ----------------------------------------------------
        #
        # If the dataset still does not contain suitable
        # products, use the complete dataset.
        # ----------------------------------------------------

        if filtered_df.empty:

            filtered_df = self.df.copy()


        # ====================================================
        # STEP 3 — BUILD TEXT FEATURES
        # ====================================================
        #
        # TF-IDF needs text to compare products.
        #
        # We combine:
        #
        #   Concern
        #   Skin Type
        #   Ingredients
        #
        # Example:
        #
        # "acne oily salicylic acid niacinamide"
        #
        # This allows the similarity engine to find products
        # relevant to both the detected concern and user's
        # skin type.
        # ====================================================

        filtered_df = filtered_df.copy()

        filtered_df["combined_features"] = (

            filtered_df["concern"]
            .fillna("")
            .astype(str)

            + " "

            + filtered_df["skin_type"]
            .fillna("")
            .astype(str)

            + " "

            + filtered_df["ingredients"]
            .fillna("")
            .astype(str)

        )


        # ====================================================
        # STEP 4 — CREATE TF-IDF VECTORS
        # ====================================================
        #
        # TF-IDF converts the product text into numerical
        # vectors.
        #
        # Important words receive higher importance while
        # commonly occurring words receive lower importance.
        # ====================================================

        try:

            vectorizer = TfidfVectorizer(
                stop_words="english"
            )

            tfidf_matrix = (
                vectorizer.fit_transform(
                    filtered_df[
                        "combined_features"
                    ]
                )
            )

        except Exception as e:

            print(
                "TF-IDF processing error: "
                f"{e}"
            )

            return []


        # ====================================================
        # STEP 5 — CREATE PERSONALIZED USER QUERY
        # ====================================================
        #
        # The query represents what the user needs.
        #
        # Example:
        #
        # Detected concern = acne
        # Skin type = oily
        #
        # Query:
        #
        # "acne oily all skin types"
        #
        # The query is then compared with every product.
        # ====================================================

        if target_skin_type in (
            "",
            "all"
        ):

            query_text = (
                f"{target_concern} "
                f"all skin types"
            )

        else:

            query_text = (
                f"{target_concern} "
                f"{target_skin_type} "
                f"all skin types"
            )


        # ====================================================
        # STEP 6 — CONVERT USER QUERY INTO TF-IDF VECTOR
        # ====================================================

        query_vector = (
            vectorizer.transform(
                [query_text]
            )
        )


        # ====================================================
        # STEP 7 — CALCULATE COSINE SIMILARITY
        # ====================================================
        #
        # Cosine Similarity measures how closely each product
        # matches the user's requirements.
        #
        # Higher score = better text similarity.
        # ====================================================

        similarity_scores = (
            cosine_similarity(
                query_vector,
                tfidf_matrix
            )[0]
        )


        # ====================================================
        # STEP 8 — RANK PRODUCTS
        # ====================================================
        #
        # Products with the highest similarity scores are
        # selected first.
        # ====================================================

        ranked_indices = (
            similarity_scores
            .argsort()[::-1]
        )

        top_indices = (
            ranked_indices[:top_n]
        )


        # ====================================================
        # STEP 9 — BUILD FINAL RECOMMENDATION RESPONSE
        # ====================================================

        recommendations = []


        for idx in top_indices:

            row = filtered_df.iloc[
                idx
            ]

            # ------------------------------------------------
            # PRODUCT ID
            # ------------------------------------------------

            try:

                product_id = int(
                    float(
                        row["product_id"]
                    )
                )

            except Exception:

                product_id = (
                    int(idx) + 1
                )


            # ------------------------------------------------
            # PRICE
            # ------------------------------------------------

            try:

                price_value = float(
                    row["price"]
                )

                price = (
                    f"${price_value:.2f}"
                )

            except Exception:

                price = str(
                    row.get(
                        "price",
                        "N/A"
                    )
                )


            # ------------------------------------------------
            # RATING
            # ------------------------------------------------

            try:

                rating = float(
                    row["rating"]
                )

            except Exception:

                rating = 0.0


            # ------------------------------------------------
            # MATCH SCORE
            # ------------------------------------------------

            match_score = round(
                float(
                    similarity_scores[idx]
                ) * 100,
                1
            )


            # ------------------------------------------------
            # FINAL PRODUCT OBJECT
            # ------------------------------------------------

            recommendations.append({

                "product_id":
                    product_id,

                "brand":
                    str(
                        row["brand"]
                    ),

                "name":
                    str(
                        row["name"]
                    ),

                "price":
                    price,

                "rating":
                    rating,

                "skin_type":
                    str(
                        row["skin_type"]
                    ),

                "target_concern":
                    str(
                        row["concern"]
                    ),

                "key_ingredients":
                    str(
                        row["ingredients"]
                    ),

                "match_score":
                    f"{match_score}%",

            })


        # ====================================================
        # STEP 10 — LOG RECOMMENDATIONS
        # ====================================================

        print(
            "\n========== PRODUCT RECOMMENDATIONS =========="
        )

        print(
            f"Detected concern : {target_concern}"
        )

        print(
            f"User skin type   : {target_skin_type}"
        )

        print(
            f"Products returned: {len(recommendations)}"
        )

        for number, product in enumerate(
            recommendations,
            start=1
        ):

            print(
                f"{number}. "
                f"{product['brand']} - "
                f"{product['name']} "
                f"({product['match_score']})"
            )

        print(
            "==============================================\n"
        )


        # ====================================================
        # STEP 11 — RETURN TOP PRODUCTS
        # ====================================================

        return recommendations


# ============================================================
# 6. CREATE GLOBAL RECOMMENDER INSTANCE
# ============================================================
#
# app.py imports this object:
#
# from backend.recommender import recommender
#
# The CSV is loaded once when the backend starts.
# ============================================================

recommender = SkincareRecommender()