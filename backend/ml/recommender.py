import os
import joblib
from sklearn.metrics.pairwise import cosine_similarity

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

def recommend_by_skin_condition(
    condition,
    skin_type="",
    skin_concerns="",
    allergies="",
    sensitive_skin=False,
    age=None,
    gender=""
):
    query = " ".join([
        str(condition),
        str(skin_type),
        str(skin_concerns),
        str(allergies),
        "sensitive skin" if sensitive_skin else "",
        str(age) if age else "",
        str(gender)
    ])

    # Convert user query into TF-IDF vector
    query_vector = tfidf.transform([query])

    # Calculate similarity between user query and every product
    similarity_scores = cosine_similarity(
        query_vector,
        tfidf.transform(df["combined_features"])
    ).flatten()

    # Add similarity score to products
    results = df.copy()
    results["similarity_score"] = similarity_scores

    # Rank products by similarity
    results = results.sort_values(
        by="similarity_score",
        ascending=False
    )

    return results[
        [
            "product_name",
            "brand_name",
            "rating",
            "price_usd"
        ]
    ].head(5).to_dict(orient="records")
