# Recommendation Engine

This package contains the scaffolding for a skincare recommendation engine that
will be integrated with the AI Skin Intelligence pipeline.

## Purpose

The recommendation system is designed to suggest skincare products based on
product metadata, reviews, and user query intent. It will ultimately support
recommendations for the weekly plan and chatbot workflows.

## Pipeline Architecture

1. CNN
2. Prediction
3. Recommendation Engine
4. Weekly Plan
5. Chatbot

## Folder Structure

- `data/` - Raw or staged datasets used by the recommender.
- `models/` - Saved ML artifacts and vectorizer/matrix files.
- `preprocess.py` - Preprocessing pipeline skeleton for dataset cleaning.
- `train_recommender.py` - Training workflow boilerplate for future model training.
- `recommender.py` - Recommendation engine skeleton with placeholder methods.
- `utils.py` - Shared helper functions for dataset loading and serialization.
- `config.py` - Constants for dataset and model paths.

## Future Workflow

- Load raw product and review data from `data/`.
- Clean and transform the dataset in `preprocess.py`.
- Train a TF-IDF vectorizer and save it using `train_recommender.py`.
- Build a similarity matrix for products using cosine similarity.
- Query the recommendation engine in `recommender.py`.
- Integrate recommendations into the weekly plan and chatbot.

## Next Steps

This module currently provides architecture only. Future work will implement:

- TF-IDF vectorization
- cosine similarity scoring
- product ranking and filtering
- recommendation logic tied to skin type and user preferences
