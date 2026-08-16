import os
import re
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import warnings

warnings.filterwarnings('ignore')

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "final_skincare_v13_complete.csv")

SKIN_TYPES = ['Universal', 'Normal', 'Combination', 'Dry', 'Oily']
SKIN_CONCERNS = [
    'Hydration/Dryness', 'Dullness/Texture', 'Anti-Aging', 'General Care',
    'Firmness/Elasticity', 'Pores', 'Brightening', 'Dark Circles',
    'Acne/Blemishes', 'Dark Spots', 'Collagen/Plumping', 'Sun Protection',
    'Redness', 'Hypoallergenic'
]
FEATURE_SPACE = SKIN_TYPES + SKIN_CONCERNS

CLINICAL_MAP_EXACT = {
    'acne': ['salicylic acid', 'benzoyl peroxide', 'sulfur', 'zinc pca', 'zinc gluconate', 'melaleuca alternifolia', 'tea tree', 'niacinamide'],
    'redness': ['centella asiatica', 'madecassoside', 'azelaic acid', 'allantoin', 'bisabolol', 'panthenol', 'colloidal oatmeal'],
    'pores': ['salicylic acid', 'niacinamide', 'charcoal', 'kaolin', 'bentonite', 'witch hazel'],
    'dark spots': ['tranexamic acid', 'kojic acid', 'alpha-arbutin', 'niacinamide', 'ascorbic acid', 'azelaic acid', 'glycolic acid'],
    'pigmentation': ['tranexamic acid', 'kojic acid', 'alpha-arbutin', 'niacinamide', 'ascorbic acid', 'azelaic acid', 'brightening'],
    'wrinkles': ['retinol', 'retinal', 'bakuchiol', 'palmitoyl tetrapeptide-7', 'palmitoyl tripeptide-1', 'acetyl hexapeptide-8', 'ascorbic acid', 'resveratrol', 'adenosine'],
    'clear skin': ['allantoin', 'bisabolol', 'centella asiatica', 'tocopherol', 'niacinamide', 'ceramide np', 'hyaluronic acid', 'squalane'],
    'Hydration/Dryness': ['hyaluronic acid', 'sodium hyaluronate', 'ceramide np', 'ceramide ap', 'ceramide eop', 'squalane', 'panthenol', 'polyglutamic acid'],
    'Dullness/Texture': ['lactic acid', 'glycolic acid', 'mandelic acid', 'gluconolactone', 'salicylic acid', 'papain'],
    'Anti-Aging': ['retinol', 'retinal', 'bakuchiol', 'palmitoyl tetrapeptide-7', 'palmitoyl tripeptide-1', 'ascorbic acid'],
    'General Care': ['allantoin', 'bisabolol', 'centella asiatica', 'tocopherol', 'niacinamide'],
    'Firmness/Elasticity': ['collagen', 'hydrolyzed collagen', 'acetyl hexapeptide-8', 'palmitoyl tripeptide-1', 'retinol'],
    'Pores': ['salicylic acid', 'niacinamide', 'charcoal', 'kaolin'],
    'Brightening': ['ascorbic acid', 'tetrahexyldecyl ascorbate', 'niacinamide', 'alpha-arbutin', 'tranexamic acid'],
    'Dark Circles': ['caffeine', 'ascorbic acid', 'retinol', 'niacinamide'],
    'Acne/Blemishes': ['salicylic acid', 'benzoyl peroxide', 'sulfur', 'zinc pca', 'tea tree'],
    'Dark Spots': ['tranexamic acid', 'kojic acid', 'alpha-arbutin', 'niacinamide', 'azelaic acid'],
    'Collagen/Plumping': ['collagen', 'hydrolyzed collagen', 'hyaluronic acid', 'palmitoyl tripeptide-1'],
    'Sun Protection': ['zinc oxide', 'titanium dioxide', 'avobenzone', 'homosalate'],
    'Redness': ['centella asiatica', 'madecassoside', 'azelaic acid', 'allantoin', 'panthenol'],
    'Hypoallergenic': ['colloidal oatmeal', 'allantoin', 'bisabolol', 'ceramide np']
}


def isolate_clinical_actives(ingredient_string):
    """Sanitizes product ingredients to extract true clinical active compounds."""
    if pd.isna(ingredient_string) or str(ingredient_string).strip() == '':
        return ""

    raw_ingredients = str(ingredient_string).split(',')
    valid_actives = []

    filler_raw_string = (
        r'water|aqua|eau|extract|oil|seed|leaf|root|bark|flower|'
        r'juice|stem|powder|butter|wax|cera|'
        r'glycol|glycerin|propanediol|butylene|hexanediol|methylpropanediol|'
        r'alcohol|phenoxyethanol|paraben|chlorphenesin|silicone|dimethicone|'
        r'benzoate|sorbate|hydroxide|chloride|sulfate|'
        r'edta|gum|crosspolymer|copolymer|carbomer|'
        r'polysorbate|steareth|stearate|cetyl|cetearyl|'
        r'peg-\d+|ppg-\d+|poloxamer|'
        r'parfum|fragrance|aroma|flavor|limonene|linalool|geraniol|citronellol|citral|'
        r'ethylhexylglycerin|caprylic capric triglyceride|bht|hydroxyacetophenone|'
        r'mica|silica|glycine|talc|alumina|tin oxide|'
        r'ci\s?\d+|lake|iron oxides|red \d+|blue \d+|yellow \d+'
    )
    filler_pattern = re.compile(rf'\b({filler_raw_string})\b', re.IGNORECASE)

    for ing in raw_ingredients:
        clean_ing = ing.strip().lower()
        if clean_ing.endswith(':'): continue
        if clean_ing.isnumeric() or len(clean_ing) <= 2: continue
        clean_ing = re.sub(r'\d+(\.\d+)?\s*%', '', clean_ing)
        normalized_ing = re.sub(r'[\/\(\)\.]', ' ', clean_ing).strip()
        normalized_ing = re.sub(r'\s+', ' ', normalized_ing)

        if not normalized_ing or normalized_ing in ['substance', 'ingredients', 'nan']:
            continue

        if not filler_pattern.search(normalized_ing):
            valid_actives.append(normalized_ing)

    return ", ".join(valid_actives)


class SkincareRecommender:
    def __init__(self, csv_path=CSV_PATH):
        self.csv_path = csv_path
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.product_profile_matrix = None
        self.lgbm_ranker = None
        self.lgbm_features = ['price', 'num_actives', 'product_type_cat']
        self._load_and_prepare()

    def _load_and_prepare(self):
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Dataset not found at {self.csv_path}")

        self.df = pd.read_csv(self.csv_path)

        # Preprocessing missing values
        self.df['skin_types'] = self.df['skin_types'].fillna('Universal')
        self.df['skin_concerns'] = self.df['skin_concerns'].fillna('General Care')
        self.df['ingredients_cleaned'] = self.df['ingredients_cleaned'].fillna('')
        self.df['price'] = pd.to_numeric(self.df['price'], errors='coerce').fillna(0.0)
        self.df['rating_norm'] = pd.to_numeric(self.df['rating_norm'], errors='coerce').fillna(0.5)
        self.df['loves_count_norm'] = pd.to_numeric(self.df['loves_count_norm'], errors='coerce').fillna(0.0)

        # Extract true clinical actives
        self.df['true_actives_only'] = self.df['ingredients_cleaned'].apply(isolate_clinical_actives)
        self.df['num_actives'] = self.df['true_actives_only'].apply(lambda x: len(str(x).split(',')) if x else 0)
        self.df['product_type_cat'] = self.df['product_type'].astype('category')

        # Feature matrix for skin types and concerns
        self.product_profile_matrix = np.zeros((len(self.df), len(FEATURE_SPACE)))
        for i in range(len(self.df)):
            row_types = str(self.df.iloc[i]['skin_types']).lower()
            row_concerns = str(self.df.iloc[i]['skin_concerns']).lower()
            for j, feature in enumerate(FEATURE_SPACE):
                feature_lower = feature.lower()
                if feature_lower in [s.lower() for s in SKIN_TYPES] and 'universal' in row_types:
                    self.product_profile_matrix[i][j] = 1
                elif feature_lower in row_types or feature_lower in row_concerns:
                    self.product_profile_matrix[i][j] = 1

        # TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(min_df=1, ngram_range=(1, 3))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['true_actives_only'].fillna('general active'))

        # Offline LightGBM Ranking Model Training
        lgbm_target = 'loves_count_norm'
        self.lgbm_ranker = lgb.LGBMRegressor(n_estimators=50, learning_rate=0.1, random_state=42, verbose=-1)
        self.lgbm_ranker.fit(self.df[self.lgbm_features], self.df[lgbm_target])

    def recommend(self, primary_concern: str, user_skin_type: str, budget: float, top_n: int = 5):
        """
        Two-Stage Inference Pipeline:
        Stage 1: Candidate Retrieval (TF-IDF & Cosine Profile Suitability)
        Stage 2: LightGBM Ranking ML Layer (Blending 75% Clinical Accuracy + 25% ML Market Engagement)
        """
        concern_key = primary_concern.lower().strip()
        
        # Candidate filtering: Price <= Budget and Skin Type Match
        pool = self.df[self.df['price'] <= budget].copy()

        def verify_skin_safety(row_skin):
            row_skin_clean = str(row_skin).strip().lower()
            return user_skin_type.lower() in row_skin_clean or 'universal' in row_skin_clean

        pool = pool[pool['skin_types'].apply(verify_skin_safety)]
        if pool.empty:
            # Fallback if budget is tight: relax to global pool with skin safety
            pool = self.df[self.df['skin_types'].apply(verify_skin_safety)].copy()

        pool_indices = pool.index.tolist()

        # User Profile Vector
        user_profile_vector = np.zeros(len(FEATURE_SPACE))
        matched_skin = [s for s in SKIN_TYPES if s.lower() == user_skin_type.lower()]
        if matched_skin:
            user_profile_vector[FEATURE_SPACE.index(matched_skin[0])] = 1
        
        query_keywords = CLINICAL_MAP_EXACT.get(concern_key, [primary_concern])
        for kw in query_keywords:
            for feat_idx, feat in enumerate(FEATURE_SPACE):
                if feat.lower() in kw.lower():
                    user_profile_vector[feat_idx] = 1

        pool['profile_score'] = cosine_similarity([user_profile_vector], self.product_profile_matrix[pool_indices]).flatten()

        # Chemistry TF-IDF Ingredient Scoring
        compiled_query_text = " ".join(query_keywords)
        user_chemical_vector = self.vectorizer.transform([compiled_query_text])
        pool['ingredient_score'] = cosine_similarity(user_chemical_vector, self.tfidf_matrix[pool_indices]).flatten()

        scaler = MinMaxScaler()
        pool['scaled_profile'] = scaler.fit_transform(pool[['profile_score']])
        pool['scaled_ingredient'] = scaler.fit_transform(pool[['ingredient_score']])
        pool['base_suitability_score'] = (pool['scaled_ingredient'] * 0.6) + (pool['scaled_profile'] * 0.4)

        # Stage 1 Candidates: Top 15 Pool
        top_15_pool = pool.sort_values(by='base_suitability_score', ascending=False).head(15).copy()

        # Stage 2: LightGBM ML Layer Ranking
        top_15_pool['lgbm_prediction'] = self.lgbm_ranker.predict(top_15_pool[self.lgbm_features])
        top_15_pool['scaled_lgbm'] = scaler.fit_transform(top_15_pool[['lgbm_prediction']])
        top_15_pool['final_two_stage_score'] = (top_15_pool['base_suitability_score'] * 0.75) + (top_15_pool['scaled_lgbm'] * 0.25)

        final_top_5 = top_15_pool.sort_values(by='final_two_stage_score', ascending=False).head(top_n)

        results = []
        for idx, prod in final_top_5.iterrows():
            prod_price = prod['price']
            prod_type = prod['product_type']

            # Find 3 Cheaper Dupes in global pool matching same product type & skin safety
            dupe_pool = self.df[
                (self.df['price'] < prod_price) &
                (self.df['product_type'] == prod_type) &
                (self.df['product_id'] != prod['product_id'])
            ].copy()

            if dupe_pool.empty:
                dupe_pool = self.df[
                    (self.df['price'] < prod_price) &
                    (self.df['product_id'] != prod['product_id'])
                ].copy()

            # Rank dupes by rating and loves count
            dupes = dupe_pool.sort_values(by=['rating_norm', 'loves_count_norm'], ascending=[False, False]).head(3)

            dupes_list = []
            for _, d in dupes.iterrows():
                dupes_list.append({
                    "product_id": str(d['product_id']),
                    "brand_name": str(d['brand_name']),
                    "product_name": str(d['product_name']),
                    "product_type": str(d['product_type']),
                    "price": float(d['price']),
                    "rating_norm": round(float(d['rating_norm']) * 5, 1),
                    "ingredients": str(d['ingredients_cleaned'])
                })

            results.append({
                "product": {
                    "product_id": str(prod['product_id']),
                    "brand_name": str(prod['brand_name']),
                    "product_name": str(prod['product_name']),
                    "product_type": str(prod['product_type']),
                    "price": float(prod['price']),
                    "rating_norm": round(float(prod['rating_norm']) * 5, 1),
                    "ingredients": str(prod['ingredients_cleaned']),
                    "skin_concerns": str(prod['skin_concerns'])
                },
                "cheaper_dupes": dupes_list
            })

        return results


recommender = SkincareRecommender()
