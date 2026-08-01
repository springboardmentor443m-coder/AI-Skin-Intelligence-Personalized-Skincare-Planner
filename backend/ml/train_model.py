import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
df = pd.read_csv("dataset/cleaned_skincare_products.csv")

# Create combined features
df["combined_features"] = (
    df["product_name"].astype(str) + " " +
    df["brand_name"].astype(str) + " " +
    df["primary_category"].astype(str) + " " +
    df["secondary_category"].astype(str) + " " +
    df["tertiary_category"].astype(str) + " " +
    df["highlights"].astype(str) + " " +
    df["ingredients"].astype(str)
)

# TF-IDF
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(df["combined_features"])

# Cosine Similarity
cosine_sim = cosine_similarity(tfidf_matrix)

# Product index mapping
indices = pd.Series(df.index, index=df["product_name"]).drop_duplicates()

# Save models
joblib.dump(tfidf, "saved_models/tfidf_vectorizer.pkl")
joblib.dump(cosine_sim, "saved_models/cosine_similarity.pkl")
joblib.dump(indices, "saved_models/product_indices.pkl")
joblib.dump(df, "saved_models/products.pkl")

print("Model training completed successfully!")