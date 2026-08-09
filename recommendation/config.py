from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PRODUCT_DATASET_PATH = BASE_DIR / "data" / "product_info.csv"
MODEL_PATH = BASE_DIR / "models"
TFIDF_MODEL_PATH = MODEL_PATH / "tfidf_vectorizer.pkl"
MATRIX_PATH = MODEL_PATH / "product_similarity_matrix.pkl"
TOP_K_PRODUCTS = 10
