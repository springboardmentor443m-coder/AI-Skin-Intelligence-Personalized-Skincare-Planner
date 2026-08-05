import os
import joblib

BASE_DIR = os.path.dirname(__file__)

tfidf = joblib.load(os.path.join(BASE_DIR, "saved_models", "tfidf_vectorizer.pkl"))
cosine_sim = joblib.load(os.path.join(BASE_DIR, "saved_models", "cosine_similarity.pkl"))
indices = joblib.load(os.path.join(BASE_DIR, "saved_models", "product_indices.pkl"))
df = joblib.load(os.path.join(BASE_DIR, "saved_models", "products.pkl"))


def recommend_products(product_name, top_n=5):
    # Check if product exists
    if product_name not in indices:
        return {"error": "Product not found"}

    idx = indices[product_name]

    similarity_scores = list(enumerate(cosine_sim[idx]))

    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    similarity_scores = similarity_scores[1:top_n + 1]

    product_indices = [i[0] for i in similarity_scores]

    recommendations = df.iloc[product_indices][
        ["product_name", "brand_name", "rating", "price_usd"]
    ]

    return recommendations.to_dict(orient="records")

def recommend_by_skin_condition(condition, top_n=5):

    skin_keywords = {
        "wrinkles": [
            "retinol",
            "collagen",
            "peptide",
            "anti-aging",
            "loss of firmness"
        ],

        "dark spots": [
            "vitamin c",
            "niacinamide",
            "brightening",
            "dark spot",
            "pigmentation"
        ],

        "puffy eyes": [
            "eye cream",
            "caffeine",
            "depuff",
            "hydrating"
        ],

        "clear skin": [
            "hydrating",
            "gentle",
            "moisturizer",
            "daily"
        ]
    }

    keywords = skin_keywords.get(condition.lower(), [])

    if not keywords:
        return []

    def keyword_score(row):
        score = 0

        ingredients = str(row["ingredients"]).lower()
        highlights = str(row["highlights"]).lower()
        product_name = str(row["product_name"]).lower()
        categories = (
            str(row["primary_category"]).lower()
            + " "
            + str(row["secondary_category"]).lower()
            + " "
            + str(row["tertiary_category"]).lower()
        )

        for keyword in keywords:
            if keyword in ingredients:
                score += 5

            if keyword in highlights:
                score += 3

            if keyword in product_name:
                score += 2

            if keyword in categories:
                score += 1

        return score


    filtered_df = df.copy()

    filtered_df["match_score"] = filtered_df.apply(
        keyword_score,
        axis=1
    )

    filtered_df = filtered_df[
        filtered_df["match_score"] > 0
    ]

    filtered_df["final_score"] = (
        filtered_df["match_score"] * 100
        + filtered_df["rating"]
    )

    filtered_df = filtered_df.sort_values(
        by="final_score",
        ascending=False
    )

    return filtered_df[
        [
            "product_name",
            "brand_name",
            "rating",
            "price_usd"
        ]
    ].head(top_n).to_dict(orient="records")