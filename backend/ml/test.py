import os
import joblib

BASE_DIR = os.path.dirname(__file__)

df = joblib.load(
    os.path.join(BASE_DIR, "saved_models", "products.pkl")
)

print(df.columns.tolist())