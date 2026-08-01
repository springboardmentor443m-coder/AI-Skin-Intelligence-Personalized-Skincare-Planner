from backend.ml.recommender import recommend_products

product = "GENIUS Liquid Collagen Serum"

recommendations = recommend_products(product)

print(recommendations)