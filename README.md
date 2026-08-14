# AI Skin Intelligence & Personalized Skincare Planner

## Overview

A full-stack AI-powered facial skin analysis and personalized skincare
planning application.

The system analyzes a user's facial image with a trained CNN model,
identifies the most probable skin concern, displays the complete model
probability distribution, recommends relevant skincare products using an
NLP-based recommendation pipeline, generates personalized skincare
routines with Groq, and compares previous and latest scans to visualize
changes over time.

The application is designed as a **facial skin analysis and
decision-support system**. Its model probabilities and generated
recommendations are not clinically validated measurements or medical
diagnoses.

------------------------------------------------------------------------

## Core Workflow

``` text
Upload / Capture Facial Image
          ↓
Image Preprocessing
          ↓
MobileNetV2-based CNN Model
          ↓
Six-Class Skin Probability Distribution
          ↓
Primary Skin Concern
          ↓
 ┌───────────────────────┬────────────────────────┐
 │                       │                        │
 ↓                       ↓                        ↓
Product Recommendation  Personalized Routine   AI Analysis
 │                       │                        │
 ↓                       ↓                        ↓
Top 5 Products           Groq-generated Plan    Skin Insights
          │
          ↓
Save Analysis to User History
          ↓
Previous vs Latest Comparison
          ↓
Probability Changes + Radar Profile + AI Report
```

------------------------------------------------------------------------

## Main Features

### 1. Authentication

-   User registration and login
-   Password protection
-   JWT-based authenticated sessions
-   User-specific analysis history
-   Protected application workflow

### 2. Facial Skin Analysis

-   Upload a facial image
-   Analyze the image using the trained skin classification model
-   Predict the primary skin concern
-   Display model confidence
-   Display the complete six-class probability distribution

### 3. Six Skin Classes

The current model uses:

``` text
1. Acne
2. Blackheads
3. Clear Skin
4. Dark Spots
5. Puffy Eyes
6. Wrinkles
```

### 4. Product Recommendation Engine

The recommendation system uses the project's skincare product dataset
rather than hard-coded product recommendations.

``` text
Detected Skin Concern
        ↓
Product Dataset
        ↓
Text / Ingredient Matching
        ↓
Similarity Scoring
        ↓
Rank Products
        ↓
Top 5 Recommendations
```

The product data is stored in:

``` text
backend/
└── data/
    └── skincare_products.csv
```

The recommendation logic is implemented in:

``` text
backend/
└── recommender.py
```

### 5. Personalized Skincare Routine

Groq is used to generate a personalized skincare routine based on the
user's analysis and available profile information.

The application can present routine guidance such as:

-   Morning routine
-   Evening routine
-   Suggested product usage
-   Skin-care guidance
-   General precautions

### 6. Skin Progress Comparison

The comparison module uses the user's two most recent scans.

``` text
Previous Scan
      ↓
Latest Scan
      ↓
Compare Six Model Probabilities
      ↓
Before → Latest → Change
      ↓
Radar Probability Profile
      ↓
AI Comparison Report
```

The comparison page includes:

-   Previous scan
-   Latest scan
-   Primary condition
-   Model confidence
-   Probability changes
-   Before vs Latest radar chart
-   AI-generated progress analysis
-   Refresh comparison

> **Important:** Probability changes represent AI model outputs. They
> should not be interpreted as clinically validated measurements of skin
> improvement.

### 7. Analysis History

Previous analyses can be stored and viewed for the authenticated user.

The history workflow allows the application to use earlier scans for
comparison and progress tracking.

### 8. GlowAI Chatbot

The application includes the **GlowAI** assistant for skincare-related
interaction and guidance through the application's AI functionality.

------------------------------------------------------------------------

## Technology Stack

### Frontend

``` text
React
Vite
Tailwind CSS
Lucide React
JavaScript
```

### Backend

``` text
Python
FastAPI
Uvicorn
Pydantic
MongoDB
Motor
PyMongo
```

### Machine Learning

``` text
TensorFlow / Keras
MobileNetV2
NumPy
Pillow
```

### AI

``` text
Groq
```

### Recommendation System

``` text
Pandas
Scikit-learn
TF-IDF / text similarity
Cosine Similarity
```

### Authentication & Security

``` text
bcrypt
JWT
python-jose
python-dotenv
```

------------------------------------------------------------------------

## Project Structure

``` text
AI-Skin-Intelligence-Personalized-Skincare-Planner/
│
├── backend/
│   ├── data/
│   │   └── skincare_products.csv
│   │
│   ├── models/
│   │   └── facial_skin_model.keras
│   │
│   ├── recommender.py
│   └── __pycache__/
│
├── Datasets/
│   └── facial skin analysis training dataset
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── AnalyticsView.jsx
│   │   │   ├── ComparisonView.jsx
│   │   │   ├── GlowAIChatbot.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HistoryView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCards.jsx
│   │   │   ├── RoutinePlanner.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── SkinScanner.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
├── app.py
├── face_analysis.ipynb
├── requirements.txt
├── .env
├── .gitignore
├── LICENSE
└── README.md
```

------------------------------------------------------------------------

## Backend Architecture

``` text
app.py
  │
  ├── Authentication
  │
  ├── Skin Analysis API
  │       ↓
  │   facial_skin_model.keras
  │
  ├── Product Recommendation API
  │       ↓
  │   recommender.py
  │       ↓
  │   skincare_products.csv
  │
  ├── Routine Generation
  │       ↓
  │   Groq
  │
  ├── History
  │       ↓
  │   MongoDB
  │
  └── Comparison API
          ↓
      Previous Scan
          +
      Latest Scan
          ↓
      Probability Changes
          ↓
      Groq Comparison Report
```

------------------------------------------------------------------------

## Machine Learning Model

The facial skin classification model is stored as:

``` text
backend/models/facial_skin_model.keras
```

The model predicts six skin-related classes and returns a probability
distribution for each class.

Example:

``` text
Acne          → 74.0%
Blackheads    →  6.7%
Clear Skin    →  0.6%
Dark Spots    → 16.5%
Puffy Eyes    →  1.0%
Wrinkles      →  1.2%
```

The class with the highest probability is presented as the primary
detected concern.

------------------------------------------------------------------------

## Dataset

The project uses a facial skin analysis dataset for model training.

The training dataset is maintained separately from the runtime model:

``` text
Datasets/
```

The trained model is then saved as:

``` text
backend/models/facial_skin_model.keras
```

The skincare recommendation dataset is maintained separately:

``` text
backend/data/skincare_products.csv
```

------------------------------------------------------------------------

## Product Recommendation Pipeline

The recommendation engine is designed to avoid hard-coded product
responses.

``` text
Skin Concern
     ↓
Dataset Filtering / Text Representation
     ↓
TF-IDF Vectorization
     ↓
Cosine Similarity
     ↓
Ranking
     ↓
Top 5 Skincare Products
```

This allows the recommendation results to be generated from the
project's skincare product dataset.

------------------------------------------------------------------------

## Skin Comparison Pipeline

The comparison API obtains the user's previous and latest analysis
records.

``` text
Previous Analysis
       │
       ├── Image
       ├── Primary Class
       └── Six Probabilities
              │
              ↓
          Comparison
              ↑
              │
Latest Analysis
       │
       ├── Image
       ├── Primary Class
       └── Six Probabilities

              ↓

Before → Latest → Change

              ↓

Radar Visualization

              ↓

Groq AI Comparison Report
```

The frontend comparison page is implemented in:

``` text
frontend/src/components/ComparisonView.jsx
```

------------------------------------------------------------------------

## Installation

### 1. Clone the project

``` bash
git clone <your-repository-url>
cd AI-Skin-Intelligence-Personalized-Skincare-Planner
```

### 2. Create and activate the Python environment

Windows:

``` powershell
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install backend dependencies

``` bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

``` bash
cd frontend
npm install
```

------------------------------------------------------------------------

## Environment Variables

Create a `.env` file in the project root.

Example:

``` env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
```

Do not commit real API keys, passwords, or database credentials to
GitHub.

------------------------------------------------------------------------

## Running the Application

### Start the FastAPI backend

From the project root:

``` powershell
.\venv\Scripts\activate
python -m uvicorn app:app --reload
```

The backend will normally run at:

``` text
http://127.0.0.1:8000
```

### Start the React frontend

Open another terminal:

``` powershell
cd frontend
npm run dev
```

Vite will display the local frontend URL in the terminal.

Open that URL in your browser.

------------------------------------------------------------------------

## API Documentation

When the FastAPI server is running, the interactive API documentation is
available through:

``` text
/api/docs
```

and the alternative documentation interface through:

``` text
/api/redoc
```

The exact available endpoints depend on the routes currently registered
by `app.py`.

------------------------------------------------------------------------

## Important Files

  ----------------------------------------------------------------------------------
  File                                           Purpose
  ---------------------------------------------- -----------------------------------
  `app.py`                                       Main FastAPI backend application

  `backend/models/facial_skin_model.keras`       Trained facial skin classification
                                                 model

  `backend/recommender.py`                       Product recommendation logic

  `backend/data/skincare_products.csv`           Skincare product dataset

  `frontend/src/services/api.js`                 Frontend API communication

  `frontend/src/components/SkinScanner.jsx`      Facial image scanning interface

  `frontend/src/components/AnalysisResult.jsx`   Displays skin analysis results

  `frontend/src/components/AnalyticsView.jsx`    Analytics and probability insights

  `frontend/src/components/ComparisonView.jsx`   Before vs latest skin comparison

  `frontend/src/components/ProductCards.jsx`     Product recommendations

  `frontend/src/components/RoutinePlanner.jsx`   Personalized skincare routine

  `frontend/src/components/GlowAIChatbot.jsx`    GlowAI assistant

  `frontend/src/components/HistoryView.jsx`      Previous analysis history

  `frontend/src/pages/Dashboard.jsx`             Main application dashboard

  `face_analysis.ipynb`                          Model development/training notebook

  `requirements.txt`                             Python dependencies

  `frontend/package.json`                        Frontend dependencies and scripts
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

## Application Modules

``` text
Authentication
     ↓
Dashboard
     ├── Skin Scanner
     ├── Skin Concern Analysis
     ├── Probability Distribution
     ├── Product Recommendations
     ├── Personalized Routine
     ├── Analytics & Insights
     ├── Skin Comparison
     ├── Analysis History
     └── GlowAI Chatbot
```

------------------------------------------------------------------------

## Responsible Use

This application is intended for educational, research, and
skincare-support purposes.

The CNN probabilities, product recommendations, and AI-generated text:

-   are not medical diagnoses
-   are not clinically validated measurements
-   should not replace professional medical advice
-   may vary depending on image quality, lighting, pose, and model
    behavior

Users should consult a qualified dermatologist or healthcare
professional for medical concerns.

------------------------------------------------------------------------

## Development Notes

The project separates the main responsibilities into:

``` text
Frontend
   ↓
User Interface + Visualization

Backend
   ↓
API + Authentication + Business Logic

Machine Learning
   ↓
Facial Skin Classification

Recommendation Engine
   ↓
Dataset-based Product Ranking

Generative AI
   ↓
Personalized Routines + Comparison Insights

Database
   ↓
User Data + Analysis History
```

This structure allows each part of the application to be developed and
maintained independently.

------------------------------------------------------------------------

## License

See the `LICENSE` file included in this repository.
