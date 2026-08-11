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

def get_skin_type_match(highlights, skin_type):
    highlights = str(highlights).lower()
    skin_type = str(skin_type).lower()

    if f"best for {skin_type}" in highlights:
        return 1

    if "best for" in highlights and skin_type in highlights:
        return 1

    return 0

def recommend_by_skin_condition(
    condition,
    skin_type="",
    skin_concerns="",
    allergies="",
    sensitive_skin=False,
    age=None,
    gender=""
):
    # Query based only on the detected skin condition
    condition_query = str(condition)

    profile_parts = []

    if skin_type:
        profile_parts.append(f"skin type {skin_type}")

    if skin_concerns:
        profile_parts.append(f"skin concerns {skin_concerns}")

    if sensitive_skin:
        profile_parts.append("sensitive skin")

    if allergies and allergies.lower() != "none":
        profile_parts.append(f"allergy {allergies}")

    profile_query = " ".join(profile_parts)

    # Convert both queries into TF-IDF vectors
    condition_vector = tfidf.transform([condition_query])
    profile_vector = tfidf.transform([profile_query])

    # 1. Parse allergens
    allergen_list = []
    if allergies and allergies.lower() != "none":
        allergen_list = [a.strip().lower() for a in allergies.split(",")]
        
    # 2. Define sensitive skin red flags
    sensitive_red_flags = ["alcohol denat", "fragrance", "parfum", "sulfate", "paraben"]
    
    # 3. Create a boolean mask for safe products
    def is_safe(ingredients_str):
        if not isinstance(ingredients_str, str):
            return True
        ingredients_lower = ingredients_str.lower()
        
        for allergen in allergen_list:
            if allergen and allergen in ingredients_lower:
                return False
                
        if sensitive_skin:
            for flag in sensitive_red_flags:
                if flag in ingredients_lower:
                    return False
                    
        return True

    safe_mask = df["ingredients"].apply(is_safe)
    safe_df = df[safe_mask].copy()

    # If filtering removes everything, return an empty list of recommendations
    if safe_df.empty:
        return []

    # Convert every safe product into TF-IDF vectors
    product_vectors = tfidf.transform(
        safe_df["combined_features"]
    )

    # Calculate two separate similarities
    condition_similarity = cosine_similarity(
        condition_vector,
        product_vectors
    ).flatten()

    profile_similarity = cosine_similarity(
        profile_vector,
        product_vectors
    ).flatten()

    # Combine both similarities
    final_score = (
        0.7 * condition_similarity
        + 0.3 * profile_similarity
    )

    # Copy dataframe and store final score
    results = safe_df.copy()

    results["condition_similarity"] = condition_similarity
    results["profile_similarity"] = profile_similarity
    results["similarity_score"] = final_score

    # Rank products
    results = results.sort_values(
        by="similarity_score",
        ascending=False
    )

    return results[
        [
            "product_name",
            "brand_name",
            "rating",
            "price_usd",
            "condition_similarity",
            "profile_similarity",
            "similarity_score"
        ]
    ].head(5).to_dict(orient="records")