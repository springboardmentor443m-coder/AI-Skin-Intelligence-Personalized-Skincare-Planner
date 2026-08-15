# AI Skin Intelligence – Personalized Skincare Planner

An AI-powered full-stack skincare analysis and personalized recommendation platform that combines **computer vision, machine learning, content-based product recommendation, and an interactive web application**.

The system allows users to create an account, upload a skin image, analyze visible skin concerns using a trained deep-learning model, view previous analyses, compare results over time, receive personalized skincare product recommendations, follow a weekly skincare plan, and interact with an AI skincare assistant.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Complete Workflow](#complete-workflow)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Backend](#backend)
- [Skin Analysis Model](#skin-analysis-model)
- [Dataset](#dataset)
- [Recommendation Engine](#recommendation-engine)
- [Frontend](#frontend)
- [Database](#database)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [AI Assistant](#ai-assistant)
- [Installation and Setup](#installation-and-setup)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Model Outputs and Training Results](#model-outputs-and-training-results)
- [Development Notes](#development-notes)
- [Project Status](#project-status)
- [License](#license)

---

## Project Overview

**AI Skin Intelligence – Personalized Skincare Planner** is designed to connect skin-image analysis with personalized skincare recommendations in a single application.

The project contains three major layers:

1. **Frontend** – Next.js/React web application used by the end user.
2. **Backend** – FastAPI application responsible for authentication, skin prediction, history, comparison, and assistant-related APIs.
3. **Recommendation Engine** – Content-based skincare product recommendation system using TF-IDF, cosine similarity, category matching, product rating, review count, and availability.

The overall concept is:

```text
                    AI Skin Intelligence
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Frontend                    Backend
       Next.js / React              FastAPI / Python
             │                           │
             └─────────────┬─────────────┘
                           │
                 Skin Image Analysis
                           │
                           ▼
                 Trained CNN Classifier
                           │
                           ▼
              Predicted Skin Concerns
                           │
                           ▼
                 Recommendation Engine
                           │
             ┌─────────────┴─────────────┐
             │                           │
      Product Recommendations      Weekly Skincare Plan
             │
             ▼
       AI Skincare Assistant
```

---

## Key Features

### User Features

- User registration and login
- JWT-based authentication
- User onboarding
- Skin image upload
- AI-based skin concern prediction
- Prediction confidence and probability information
- Analysis history
- Week-to-week analysis comparison
- Analytics dashboard
- Personalized skincare product recommendations
- Weekly skincare planning
- AI skincare assistant
- User settings

### Machine Learning Features

- Image-based skin classification
- Trained Keras model
- Four supported prediction classes:
  - `clear face`
  - `darkspots`
  - `puffy eyes`
  - `wrinkles`
- Training accuracy and loss visualization
- Image preprocessing before prediction

### Recommendation Features

- Natural-language skincare queries
- TF-IDF vectorization
- Cosine similarity
- Product category matching
- Rating-based quality contribution
- Log-scaled review contribution
- Out-of-stock filtering
- Ranked product recommendations

---

# System Architecture

```text
                         ┌──────────────────────┐
                         │       User           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Next.js Frontend     │
                         │ React + TypeScript    │
                         └──────────┬───────────┘
                                    │ REST API
                                    ▼
                    ┌────────────────────────────────┐
                    │       FastAPI Backend          │
                    │                                │
                    │ Authentication                 │
                    │ Prediction                    │
                    │ History                       │
                    │ Comparison                    │
                    │ Assistant                     │
                    └───────┬───────────┬────────────┘
                            │           │
                    ┌───────▼──────┐    │
                    │ Skin CNN     │    │
                    │ Keras Model  │    │
                    └───────┬──────┘    │
                            │           │
                            ▼           ▼
                    Skin Prediction   AI Assistant
                            │
                            ▼
                    ┌──────────────────┐
                    │ Recommendation   │
                    │ Engine           │
                    └────────┬─────────┘
                             │
                             ▼
                    Ranked Products
```

---

# Complete Workflow

```text
1. User registers / logs in
              │
              ▼
2. Frontend stores authentication state
              │
              ▼
3. User uploads skin image
              │
              ▼
4. Frontend sends image to FastAPI
              │
              ▼
5. Backend saves image in uploads/
              │
              ▼
6. Image preprocessing
              │
              ▼
7. Keras CNN model prediction
              │
              ▼
8. Prediction result returned
              │
              ├── Predicted class
              ├── Confidence
              └── Probabilities
              │
              ▼
9. Result stored / displayed in history
              │
              ▼
10. Recommendation query is generated
              │
              ▼
11. Recommendation Engine
              │
              ├── Query parsing
              ├── TF-IDF
              ├── Cosine similarity
              ├── Category matching
              ├── Quality score
              └── Availability filtering
              │
              ▼
12. Ranked skincare products
              │
              ▼
13. Weekly skincare plan / assistant
```

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| Next.js 16.2.6 | Web framework |
| React 19 | UI |
| TypeScript | Type-safe development |
| Tailwind CSS v4 | Styling |
| Axios | HTTP requests |
| SWR | Data fetching and caching |
| Zustand | Authentication/global state |
| Framer Motion | UI animations |
| Recharts | Data visualization |
| Lucide React | Icons |
| Zod | Validation |
| pnpm | Package management |

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend and ML integration |
| FastAPI | REST API |
| Uvicorn | ASGI server |
| TensorFlow / Keras | Skin classification model |
| OpenCV | Image processing |
| SQLite | Application database |
| JWT | Authentication |
| Groq integration | AI assistant functionality |

## Recommendation Engine

| Technology | Purpose |
|---|---|
| Python | Recommendation pipeline |
| Pandas | Dataset processing |
| Scikit-learn | TF-IDF and cosine similarity |
| Parquet | Processed product dataset |
| Pickle | Model artifact serialization |
| FastAPI | Recommendation API |

---

# Repository Structure

The project is organized as a full-stack application:

```text
AI-Skin-Intelligence-Personalized-Skincare-Planner/
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── assistant/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── sidebar.tsx
│   │   └── protected-layout.tsx
│   │
│   ├── hooks/
│   │   └── use-skin-analysis.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── auth-store.ts
│   │
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── recommendation/
│   ├── api.py
│   ├── config.py
│   ├── preprocess.py
│   ├── query_parser.py
│   ├── recommender.py
│   ├── train_recommender.py
│   ├── utils.py
│   ├── data/
│   │   ├── product_info.csv
│   │   └── reviews_*.csv
│   ├── models/
│   │   ├── tfidf_vectorizer.pkl
│   │   └── product_tfidf_matrix.pkl
│   ├── processed_products.parquet
│   └── README.md
│
├── dataset/
│   ├── processed/
│   │   ├── clear face/
│   │   ├── darkspots/
│   │   ├── puffy eyes/
│   │   └── wrinkles/
│   │
│   └── raw/
│       ├── clear face/
│       ├── darkspots/
│       ├── puffy eyes/
│       └── wrinkles/
│
├── models/
│   └── skin_classifiers.keras
│
├── outputs/
│   ├── traning_accuracy.png
│   └── training_loss.png
│
├── uploads/
│   └── ...
│
├── skin_ai.db
│
├── backend/
│   ├── .env
│   ├── app.py
│   ├── auth.py
│   ├── compare_predictions.py
│   ├── config.py
│   ├── database.py
│   ├── dataset_loader.py
│   ├── dependencies.py
│   ├── evaluate_model.py
│   ├── explore_dataset.py
│   ├── jwt_handler.py
│   ├── models.py
│   ├── predict.py
│   ├── preprocess_images.py
│   ├── requirements.txt
│   ├── save_results.py
│   ├── schemas.py
│   ├── train_model.py
│   ├── llm/
│   │   └── groq_service.py
│   └── routes/
│       └── assistant.py
│
│
└── README.md
```

> The root `README.md` is the unified documentation for the complete project. The component-level README files can remain inside `frontend/` and `recommendation/` as detailed documentation for those modules.

---

# Backend

The backend is built with **FastAPI** and provides the REST API consumed by the frontend.

## Backend Folder

```text
backend/
├── .env
├── app.py
├── auth.py
├── compare_predictions.py
├── config.py
├── database.py
├── dataset_loader.py
├── dependencies.py
├── evaluate_model.py
├── explore_dataset.py
├── jwt_handler.py
├── models.py
├── predict.py
├── preprocess_images.py
├── requirements.txt
├── save_results.py
├── schemas.py
├── train_model.py
│
├── llm/
│   └── groq_service.py
│
└── routes/
    └── assistant.py
```

> `__pycache__/` and generated `.pyc` files are omitted from the README structure because they are Python cache files and are not source files.

# Skin Analysis Model

The trained skin classifier is stored at:

```text
models/skin_classifiers.keras
```

The model predicts one of the project's four skin-analysis classes:

```text
clear face
darkspots
puffy eyes
wrinkles
```

The prediction response contains:

```text
predicted_class
confidence
probabilities
```

Conceptually:

```text
Input Image
     │
     ▼
Image Preprocessing
     │
     ▼
CNN / Keras Model
     │
     ▼
Class Probabilities
     │
     ├── clear face
     ├── darkspots
     ├── puffy eyes
     └── wrinkles
     │
     ▼
Highest Probability Class
```

---

# Dataset

The project contains the skin-image dataset in:

```text
dataset/
├── processed/
│   ├── clear face/
│   ├── darkspots/
│   ├── puffy eyes/
│   └── wrinkles/
│
└── raw/
    ├── clear face/
    ├── darkspots/
    ├── puffy eyes/
    └── wrinkles/
```

### Raw Dataset

The `raw/` directory contains the original class-organized images.

### Processed Dataset

The `processed/` directory contains images prepared for model training.

The dataset is used to train the skin classification model stored in:

```text
models/skin_classifiers.keras
```

---

# Recommendation Engine

The recommendation engine provides personalized skincare product recommendations based on a user's natural-language skincare requirement.

Example queries:

```text
acne oily skin
```

```text
moisturizer for dry skin
```

The recommendation workflow is:

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
Availability Filtering
      │
      ▼
Final Recommendation Score
      │
      ▼
Ranked Products
```

## Recommendation Signals

### Cosine Similarity

The primary relevance signal compares the user's query vector with product TF-IDF vectors.

### Category Match

Category relevance provides an additional ranking adjustment.

Conceptually:

```text
1.0  → strong category match
0.5  → partial category match
0.0  → no requested category
-1.0 → clearly mismatched category
```

### Product Quality

The quality contribution uses:

- Product rating
- Number of reviews

Rating has the stronger contribution, while review count is log-scaled.

### Product Availability

Out-of-stock products are excluded from recommendations.

## Recommendation Output

A recommendation contains information such as:

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

---

# Recommendation Folder

```text
recommendation/
├── api.py
├── config.py
├── preprocess.py
├── query_parser.py
├── recommender.py
├── train_recommender.py
├── utils.py
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

| File | Responsibility |
|---|---|
| `preprocess.py` | Cleans product data and creates searchable text |
| `train_recommender.py` | Trains TF-IDF vectorizer and product matrix |
| `recommender.py` | Core recommendation and ranking logic |
| `query_parser.py` | Parses natural-language skincare requirements |
| `api.py` | FastAPI recommendation interface |
| `utils.py` | Shared utilities |
| `config.py` | Recommendation configuration |

---

# Frontend

The frontend is a **Next.js 16.2.6 + React 19 + TypeScript** application.

It provides the complete user interface for the platform.

## Main Frontend Areas

```text
Login
  │
Register
  │
Onboarding
  │
Dashboard
  ├── Skin Analysis
  ├── Recommendations
  ├── Weekly Plan
  ├── History
  ├── Analytics
  ├── AI Assistant
  └── Settings
```

## Frontend Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── onboarding/
│   ├── dashboard/
│   ├── upload/
│   ├── history/
│   ├── analytics/
│   ├── assistant/
│   └── settings/
│
├── components/
├── hooks/
├── lib/
└── public/
```

### Frontend Libraries

- Axios – API communication
- SWR – fetching, caching, and revalidation
- Zustand – authentication/global state
- Framer Motion – animations
- Recharts – analytics visualization
- Zod – validation
- Lucide React – icons
- Tailwind CSS – styling

---

# Database

The project uses:

```text
skin_ai.db
```

as the application SQLite database.

The database is used by the backend for application data such as user/account-related information and analysis-related persistence.

The exact database schema should be treated as implementation-specific and is not duplicated in this README.

---

# API Reference

The frontend communicates with the backend using REST APIs.

## Core Backend Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API status |
| `GET` | `/health` | Backend/model health |
| `POST` | `/predict` | Analyze uploaded skin image |
| `POST` | `/compare` | Compare stored analysis results |
| `POST` | `/register` | Register a user |
| `POST` | `/login` | Authenticate a user |
| `GET` | `/history` | Retrieve analysis history |
| `GET` | `/test-groq` | Test Groq integration |
| `POST` | `/assistant` | AI skincare assistant |

## Recommendation API

The recommendation module exposes:

```text
GET  /api/recommend
POST /api/recommend
```

The recommendation request uses a natural-language query.

Example:

```json
{
  "query": "acne oily skin"
}
```

The recommendation API passes the query to the recommendation engine and returns ranked products.

> The exact HTTP method exposed by the currently connected frontend/backend should be treated as the source of truth when deploying or changing the API.

---

# Authentication Flow

```text
User
 │
 ▼
Register
 │
 ▼
Backend Registration API
 │
 ▼
User Account
 │
 ▼
Login
 │
 ▼
JWT Authentication
 │
 ▼
Frontend Authentication State
 │
 ▼
Protected Routes
```

Authenticated application areas include:

- Dashboard
- Upload / Analysis
- History
- Analytics
- Assistant
- Settings

---

# AI Assistant

The application includes an AI skincare assistant.

The frontend communicates with the backend assistant endpoint:

```text
POST /assistant
```

The backend provides the integration layer for the assistant and includes a Groq integration/test endpoint:

```text
GET /test-groq
```

The assistant is intended to provide skincare-related conversational support inside the application.

---

# Installation and Setup

## Prerequisites

### Backend

- Python 3.x
- Virtual environment
- FastAPI
- Uvicorn
- TensorFlow / Keras
- OpenCV
- SQLite
- Required Python dependencies

### Frontend

- Node.js 18+
- pnpm

### Recommendation Engine

- Python 3.x
- Pandas
- Scikit-learn
- Required recommendation dependencies

---

# Backend Setup

From the project root, create and activate a Python virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies according to the project's dependency file.

Then start the FastAPI application with Uvicorn using the backend application's entry point.

A typical development server is:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

```bash
cd frontend
pnpm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

# Recommendation Engine Setup

Install the recommendation dependencies and prepare the product dataset.

The recommendation pipeline can be run in this order:

```text
1. preprocess.py
        │
        ▼
2. processed_products.parquet
        │
        ▼
3. train_recommender.py
        │
        ├── tfidf_vectorizer.pkl
        └── product_tfidf_matrix.pkl
        │
        ▼
4. recommender.py / api.py
```

The generated model artifacts must remain synchronized with the processed product dataset.

---

# Running the Project

The complete development setup consists of the frontend and backend services.

### Terminal 1 – Backend

Start the FastAPI backend:

```text
127.0.0.1:8000
```

### Terminal 2 – Frontend

```bash
cd frontend
pnpm dev
```

Frontend:

```text
http://localhost:3000
```

### Recommendation API

The recommendation service runs through its FastAPI application and exposes the recommendation endpoint.

---

# Environment Variables

## Frontend

Create:

```text
frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Do not commit `.env.local` or private credentials.

## Backend

Backend secrets and external-service credentials should be stored in the backend environment configuration rather than committed to Git.

---

# Model Outputs and Training Results

Training visualizations are stored in:

```text
outputs/
├── traning_accuracy.png
└── training_loss.png
```

These files provide visual records of model training performance.

> The existing filename `traning_accuracy.png` is preserved exactly as it exists in the project.

---

# Uploads

User-uploaded skin images are stored under:

```text
uploads/
```

The prediction workflow uses uploaded images as input to the skin classification pipeline.

Because uploaded images can contain user data, the `uploads/` directory should be handled carefully when publishing or deploying the repository.

---

# Development Notes

## Frontend

- Keep API communication centralized through `frontend/lib/api.ts`.
- Use SWR where client-side caching and revalidation are appropriate.
- Use the existing Zustand authentication store for authentication state.
- Reuse existing components and protected layouts.
- Maintain responsive behavior.
- Keep TypeScript types synchronized with API responses.

## Recommendation Engine

- Keep semantic relevance as the primary ranking signal.
- Do not allow popularity to dominate textual relevance.
- Preserve availability filtering.
- Keep TF-IDF artifacts synchronized with the processed dataset.
- Test different skincare queries after modifying ranking logic.

## Backend

- Keep model loading and prediction behavior synchronized with the trained `.keras` model.
- Preserve the API contract used by the frontend.
- Avoid committing credentials or secrets.
- Keep uploaded files and database data separate from source-code configuration.

---

# Project Status

The project is currently considered **complete for the demonstrated project scope**.

The implemented system brings together:

- Full-stack web interface
- User authentication
- Skin image upload
- AI skin concern classification
- Prediction history
- Analysis comparison
- Analytics
- Product recommendation engine
- Weekly skincare planning
- AI skincare assistant
- SQLite persistence
- Training-result visualizations

The project is suitable for repository submission and project documentation.

---

# Important Notes

### Model Limitations

The skin classifier is a machine-learning project intended for project/demo purposes. Its predictions should not be treated as a medical diagnosis.

### Data Privacy

The project can process:

- Uploaded skin images
- User account information
- Analysis history
- Recommendation-related information

Sensitive data should not be committed to the public repository.

Recommended exclusions include:

```text
.env
.env.local
*.db
uploads/*
```

unless the project specifically requires a database or sample files to be included.

---

# License

MIT License
