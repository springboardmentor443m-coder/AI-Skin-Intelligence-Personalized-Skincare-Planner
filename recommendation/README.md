# Recommendation Engine

This package implements the skincare product recommendation engine used by the AI Skin Intelligence project.

It uses product metadata and TF-IDF-based content similarity to identify and rank skincare products according to a user's natural-language skincare requirement.

## Purpose

The recommendation engine accepts a skincare query such as:

```text
acne oily skin
```

or:

```text
moisturizer for dry skin
```

and returns ranked skincare products based on:

* Textual similarity between the query and product information
* Requested product category
* Product rating
* Number of reviews
* Product availability

## Recommendation Pipeline

The current recommendation workflow is:

```text
Product Dataset
      │
      ▼
Preprocessing
      │
      ▼
Processed Product Dataset
      │
      ▼
TF-IDF Vectorization
      │
      ▼
Product TF-IDF Matrix
      │
      ▼
User Skincare Query
      │
      ▼
Query Vector
      │
      ▼
Cosine Similarity
      │
      ▼
Category Matching
      │
      ▼
Quality Score
      │
      ▼
Final Recommendation Score
      │
      ▼
Ranked Products
```

## Folder Structure

```text
recommendation/
├── api.py
├── config.py
├── preprocess.py
├── query_parser.py
├── recommender.py
├── train_recommender.py
├── utils.py
├── README.md
│
├── data/
│   ├── product_info.csv
│   └── reviews_*.csv
│
├── models/
│   ├── tfidf_vectorizer.pkl
│   └── product_tfidf_matrix.pkl
│
└── processed_products.parquet
```

### Main Files

* `preprocess.py` - Loads and cleans the product dataset and creates searchable product text.
* `train_recommender.py` - Trains the TF-IDF vectorizer and creates the product TF-IDF matrix.
* `recommender.py` - Core content-based recommendation engine.
* `query_parser.py` - Converts natural-language skincare queries into structured features.
* `api.py` - FastAPI interface for serving recommendations.
* `utils.py` - Shared dataset, serialization, and text utilities.
* `config.py` - Recommendation-related configuration constants.

## Preprocessing

`preprocess.py` prepares the product dataset for recommendation.

The preprocessing workflow includes:

1. Loading the product dataset.
2. Validating required product columns.
3. Cleaning missing values.
4. Parsing list-like product fields.
5. Creating consolidated search text.
6. Saving the processed dataset as:

```text
processed_products.parquet
```

The generated search text is used as the input for TF-IDF training.

## TF-IDF Model

`train_recommender.py` trains a `TfidfVectorizer` using the processed product search text.

The generated artifacts are:

```text
models/tfidf_vectorizer.pkl
models/product_tfidf_matrix.pkl
```

The vectorizer converts product text into numerical TF-IDF representations.

The product TF-IDF matrix stores the corresponding representations for the product dataset.

## Recommendation Engine

The main implementation is in `recommender.py`.

### Model Loading

`RecommendationEngine.load_models()` loads:

* TF-IDF vectorizer
* Product TF-IDF matrix
* Processed product dataset

The engine validates that all required files exist before loading them.

### Query Processing

`build_query()` converts a user's skincare requirement into the same TF-IDF representation used for the products.

### Category Detection

The engine detects requested product categories from the user's query.

Supported mappings include categories such as:

* Moisturizers
* Creams
* Serums
* Cleansers
* Face wash
* Toners
* Sunscreen / SPF
* Masks
* Eye care
* Acne treatments
* Dark spots
* Pigmentation

These detected categories are compared with the product's secondary and tertiary categories.

## Recommendation Scoring

The recommendation engine uses multiple signals.

### 1. Cosine Similarity

The primary relevance signal is cosine similarity between:

```text
User Query Vector
        ↓
Product TF-IDF Vectors
```

Products with zero or negative similarity are excluded.

### 2. Category Match

Category relevance provides an additional score:

```text
1.0  → strong category match
0.5  → partial category match
0.0  → no requested category
-1.0 → clearly mismatched category
```

Category relevance adjusts the final ranking score without replacing semantic similarity.

### 3. Product Quality

A secondary quality score uses:

* Product rating
* Number of reviews

Rating contributes more strongly than review count.

Review count is log-scaled so products with extremely large numbers of reviews do not dominate the ranking.

### 4. Product Availability

Products marked as out of stock are excluded from recommendations.

## Final Ranking

The engine combines the recommendation signals into a final score.

Conceptually:

```text
Final Score
    =
Cosine Similarity
    +
Category Relevance Adjustment
    +
Small Quality Contribution
```

Products are sorted by the final recommendation score in descending order.

The engine then returns the requested number of top products.

## Recommendation Output

Each recommendation contains information including:

```text
product_id
product_name
brand_name
category
subcategory
rating
reviews
price_usd
similarity_score
recommendation_score
```

The default recommendation count is:

```text
10 products
```

## Query Parser

`query_parser.py` provides a separate natural-language query parsing layer.

`parse_query()`:

1. Normalizes the user query.
2. Detects known skincare concepts.
3. Detects supported product types.
4. Produces structured query information.

This component can be used as part of future or extended recommendation workflows.

## FastAPI Integration

`api.py` exposes the recommendation engine through FastAPI.

### Health Endpoint

```text
GET /
```

Returns the recommendation API status.

### Recommendation Endpoint

```text
POST /api/recommend
```

The endpoint accepts a recommendation request containing a query.

Example request:

```json
{
  "query": "acne oily skin"
}
```

The API passes the query to `RecommendationEngine.recommend_products()` and returns the ranked recommendation list.

### API Startup

The recommendation API runs on:

```text
127.0.0.1:8000
```

It can be started through the FastAPI/Uvicorn application defined in `api.py`.

## Current Implementation Status

The recommendation engine currently provides:

* Product dataset preprocessing
* Missing-value handling
* Search-text generation
* TF-IDF vectorization
* Product TF-IDF matrix generation
* Cosine similarity matching
* Product category detection
* Category relevance scoring
* Rating and review quality scoring
* Out-of-stock filtering
* Product ranking
* Natural-language query parsing
* FastAPI recommendation endpoint

## Integration

The recommendation engine is intended to integrate with the wider AI Skin Intelligence pipeline:

```text
Skin Image
    │
    ▼
Skin Analysis / Prediction
    │
    ▼
Recommendation Engine
    │
    ▼
Personalized Product Recommendations
    │
    ▼
Weekly Skincare Plan / Assistant
```

The recommendation engine is currently focused on product retrieval and ranking based on the supplied query.

## Development Notes

When modifying the recommendation engine:

* Keep recommendation relevance as the primary ranking signal.
* Avoid allowing popularity to dominate semantic relevance.
* Preserve product availability filtering.
* Keep model artifacts synchronized with the processed dataset.
* Test recommendation results with different skincare queries after modifying ranking logic.

## License

MIT
