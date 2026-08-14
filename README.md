# 🧴 AI Skin Intelligence — Personalized Skincare Planner

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.21.0-FF6F00.svg?style=flat&logo=tensorflow)](https://www.tensorflow.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end AI-powered skincare platform that leverages Computer Vision deep learning models, Retrieval-Augmented Generation (RAG), and intelligent recommendation engines to provide personalized skin diagnostics, AM/PM skincare routines, multi-language support, and tailored product recommendations.

---

## 🚀 Key Features

* **📷 Computer Vision Skin Analysis**: Real-time camera capture or photo upload to evaluate facial features, classify skin type (*oily, dry, combination, normal, sensitive*) and detect skin concerns (*acne, dark spots, wrinkles, redness, eye bags, enlarged pores*).
* **📅 Dynamic AM/PM Routine Planner**: Automatically builds custom morning and evening skincare regimens based on AI skin analysis, user age, skin goals, climate/environment, and budget preferences.
* **🧪 Ingredient-Aware Product Recommendation Engine**: Matches user skin profiles with suitable skincare products while preventing ingredient conflicts (e.g., Retinol + AHA/BHA) and cross-checking known allergies.
* **💬 RAG-Powered AI Skincare Assistant**: Intelligent chatbot utilizing Retrieval-Augmented Generation to answer skincare questions, explain ingredient benefits, and give evidence-backed advice.
* **🌍 Multi-Language Localization**: Full UI localization supporting multiple languages including English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), Bengali (বাংলা), Spanish (Español), French (Français), and more.
* **🔒 Enterprise Authentication & Security**: JWT bearer authentication, bcrypt password hashing, automatic schema migrations, and Role-Based Access Control (User, Consultant, Dermatologist, Admin).

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[React + Vite Frontend] -->|REST API / JSON| API[FastAPI Backend]
    
    subgraph Backend Services
        API --> Auth[JWT Auth & User Service]
        API --> ML[TensorFlow ML Inference Engine]
        API --> Routine[Routine Generator Engine]
        API --> Product[Product Matching Engine]
        API --> RAG[RAG AI Skincare Assistant]
    end

    subgraph Data & Storage
        Auth --> DB[(PostgreSQL Database)]
        Routine --> DB
        Product --> DB
        ML --> Models[Keras Trained Models]
    end

    subgraph AI Training Pipeline
        Dataset[Cleaned Skincare Datasets] --> Train[skincare-ai Scripts]
        Train --> Models
    end
```

---

## 📁 Repository Structure

```text
AISkin _Care/
├── skincare-ai/                 # Machine Learning & AI Training Pipeline
│   ├── datasets/                # Training & evaluation image datasets
│   ├── models/                  # Saved Keras model files (.keras, .h5)
│   ├── clean_dataset.py         # Image dataset cleaning & normalization
│   ├── train_skin_concern.py    # Training CNN/MobileNet model for skin concerns
│   ├── train_skin_type_v5.py    # Training CNN model for skin type classification
│   ├── confusion_matrix.py      # Confusion matrix generation & accuracy evaluation
│   └── evaluate_skin_type.py    # Model validation script
│
├── skincare-backend/            # Production API & Business Logic Server
│   ├── app/
│   │   ├── core/                # DB config, settings, auto-migrations
│   │   ├── ml/                  # Keras model inference & image preprocessing
│   │   ├── models/              # SQLAlchemy database ORM models
│   │   ├── routes/              # FastAPI endpoint routers (Auth, Products, RAG, Skin Analysis)
│   │   ├── schemas/             # Pydantic data schemas
│   │   └── services/            # RAG assistant & Routine Generator services
│   ├── import_products.py       # Catalog seeder script
│   ├── requirements.txt         # Python backend dependencies
│   └── .env.example             # Backend environment template
│
└── skincare-frontend/           # Modern Web Client (React + Vite)
    ├── src/
    │   ├── api.js               # Axios API client & backend endpoints
    │   ├── AuthPage.jsx         # Sign up / Login user interface
    │   ├── Dashboard.jsx        # Main user portal & routine tracker
    │   ├── PhotoAnalysis.jsx    # Camera & photo upload AI diagnostic tool
    │   ├── translations.js      # Multi-language dictionary
    │   └── index.css            # Dark mode & glassmorphism custom styles
    ├── package.json             # React dependencies & scripts
    └── vite.config.js           # Vite development server config
```

---

## ⚙️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Modern CSS Variables, Glassmorphism UI, Responsive Flex/Grid)
- **Icons & UI**: Custom SVG & Dynamic Animations

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM & Alembic migrations
- **Authentication**: OAuth2 JWT Bearer tokens + Passlib (bcrypt)
- **Validation**: Pydantic v2

### AI & Machine Learning
- **Deep Learning**: TensorFlow 2.21 / Keras
- **Computer Vision**: OpenCV, Pillow (PIL)
- **Architecture**: Transfer learning with CNN / MobileNet backbone for real-time mobile/web inference
- **Warmup Optimization**: Background non-blocking model pre-loading on server startup

---

## 📦 Prerequisites

Before running the project locally, ensure you have installed:
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **PostgreSQL**: `v14` or higher (running locally or via Docker)

---

## 🛠️ Installation & Setup

### 1. Database Setup

Create a PostgreSQL database for the project:
```sql
CREATE DATABASE skincare_db;
```

---

### 2. Backend Setup (`skincare-backend`)

1. Navigate to the backend directory:
   ```bash
   cd skincare-backend
   ```

2. Create and activate a Python virtual environment:
   - **Linux / macOS**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   - **Windows**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment configuration file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/skincare_db
   SECRET_KEY=your_super_secret_random_key_here
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. Seed products database (Optional but recommended):
   ```bash
   python -m app.import_products
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API server will run at `http://127.0.0.1:8000`.*
   *Interactive API docs available at `http://127.0.0.1:8000/docs`.*

---

### 3. Frontend Setup (`skincare-frontend`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd skincare-frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web client will run at `http://localhost:5173`.*

---

### 4. AI Training Pipeline Setup (`skincare-ai`)

If you wish to retrain or inspect the deep learning models:

1. Navigate to `skincare-ai`:
   ```bash
   cd skincare-ai
   ```

2. Clean and inspect your dataset:
   ```bash
   python clean_dataset.py
   python inspect_dataset_v2.py
   ```

3. Train skin concern classification model:
   ```bash
   python train_skin_concern.py
   ```

4. Evaluate performance:
   ```bash
   python confusion_matrix.py
   python evaluate_skin_type.py
   ```

---

## 📡 API Reference Overview

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/signup` | Register a new user |
| **Auth** | `POST` | `/auth/login` | Authenticate & retrieve JWT token |
| **Profile** | `GET` | `/skin-profile/` | Fetch current user skin profile |
| **Profile** | `POST` | `/skin-profile/` | Create or update skin profile questionnaire |
| **Analysis** | `POST` | `/skin-analysis/analyze` | Analyze facial image & return AI predictions |
| **Products** | `GET` | `/products/` | List & filter skincare product catalog |
| **Products** | `GET` | `/products/recommendations` | Get ingredient-matched recommendations |
| **RAG** | `POST` | `/rag/ask` | Send query to AI Skincare Assistant |

---

## 🧪 Running Tests

- **Backend / Model Validation**:
  ```bash
  cd skincare-backend
  pytest
  python -m app.ml.test_skin_validation
  ```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.