# Skinly – AI Skin Intelligence & Personalized Skincare Planner

## Overview
Skinly is an AI-powered personalized skincare application that goes beyond generic advice. By combining computer vision for skin condition analysis and large language models (LLMs) for an intelligent skincare assistant, Skinly provides users with tailored skincare routines, product recommendations, and expert-like guidance. It aims to demystify skincare by dynamically adapting to a user's unique profile, lifestyle, and changing skin conditions.

## Key Features
*   **User Registration and Login:** Secure authentication to manage personal skincare journeys.
*   **Forgot Password / Password Reset:** Securely reset user passwords.
*   **Skin Profile and Lifestyle information:** Detailed profiling including skin type, concerns, allergies, sensitivity, sleep, water intake, stress, and diet.
*   **AI Skin Image Analysis:** Uploading an image to predict current skin conditions.
*   **Personalized 7-Day Skincare Routine:** Dynamic generation of daily skincare steps based on user profiles.
*   **Daily Skin Check-in / Routine Adaptation:** Adjusting routines based on user feedback and changing needs.
*   **Product Recommendations:** Targeted suggestions based on both the user's static profile and real-time image analysis.
*   **SkinMate AI Chatbot:** An intelligent assistant powered by Llama 3.
*   **Streaming SkinMate responses:** Real-time token streaming for a responsive chatbot experience.
*   **Recent in-session SkinMate conversation context:** Chatbot maintains recent conversation context for fluid interactions during the session.
*   **Progress Tracking:** Basic progress logging with image and notes submission.
*   **Skin Analysis History:** Track past skin image analysis results.
*   **Tab-based Dashboard:** A clean, organized interface for managing skincare.
*   **7-Day Routine Completion chart:** Visual tracking of routine adherence.
*   **User Skin Report / Dashboard summary:** A comprehensive overview of the user's skin profile and progress.

## AI / ML Components
Skinly utilizes several interconnected AI/ML systems to provide a personalized experience:
*   **Skin Condition Image Classification:** A TensorFlow/Keras-based model using a MobileNetV2 architecture analyzes uploaded facial images. The model accepts an uploaded skin image and returns a predicted condition and confidence score. Training categories are exactly:
    * wrinkles
    * clear skin
    * puffy eyes
    * dark spots
*   **Product Recommendation:** Uses TF-IDF vectorization and Cosine Similarity on a skincare/Sephora product dataset to find matching products based on identified conditions and skin profiles.
*   **SkinMate AI Chatbot:** Driven by **Llama 3** running locally via **Ollama**.

## SkinMate Architecture
SkinMate operates as an advanced assistant tailored for skincare. Its current architecture:
1.  **Input:** FastAPI receives the user's question, available skin-condition/check-in context, and recent in-session chat history from the frontend.
2.  **Processing:** FastAPI constructs a strict prompt with guardrails (e.g., avoiding allergy triggers, no medical diagnoses) using the user's stored skin profile and the provided context.
3.  **Inference:** The prompt is sent to a local **Ollama** instance running **Llama 3**.
4.  **Output:** Llama 3 generates the response, which FastAPI **streams** back to the React frontend in real-time.

*Note: The current SkinMate chatbot processes text context only; it does not directly process or "see" uploaded images.*

## Technology Stack
**Frontend:**
*   React + Vite
*   JavaScript
*   HTML/CSS

**Backend:**
*   Python
*   FastAPI
*   SQLAlchemy
*   Pydantic
*   PostgreSQL
*   psycopg2
*   Uvicorn

**AI/ML:**
*   TensorFlow/Keras
*   MobileNetV2
*   scikit-learn
*   pandas
*   NumPy
*   Ollama
*   Llama 3

## Project Structure
```text
AI-Skin-Intelligence-Personalized-Skincare-Planner/
├── backend/                  # FastAPI Application
│   ├── app/                  # Core API logic
│   │   ├── main.py           # Application entry point
│   │   ├── routes.py         # API endpoints
│   │   ├── models.py         # SQLAlchemy DB models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── crud.py           # Database operations
│   │   └── ollama_service.py # LLM interaction logic
│   ├── ml/                   # Inference scripts for ML models
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Application (Vite)
│   ├── src/                  # React components and pages
│   └── package.json          # Node dependencies
├── ml/                       # Model training notebooks & saved models
└── database/                 # Database scripts/configs
```

## Database
The application uses PostgreSQL with the following core entities:
*   **`users`**: Stores authentication details (email, password hash, role).
*   **`skin_profile`**: Stores biological/dermatological data (age, gender, skin type, concerns, allergies, sensitive skin).
*   **`lifestyle`**: Stores daily habits affecting skin health (sleep hours, water intake, stress level, diet).
*   **`progress`**: Stores progress/check-in information including image path, notes, and created_at timestamp to track changes over time.

## API Overview
The FastAPI backend exposes several key endpoints (`/docs` for Swagger UI):
*   `POST /register`, `POST /login`, `POST /reset-password`: User authentication and account management.
*   `POST`, `PUT`, `GET /skin-profile/{user_id}`: Manage user skin profile data.
*   `POST`, `PUT`, `GET /lifestyle/{user_id}`: Manage user lifestyle data.
*   `GET /recommend-by-profile`: Get product recommendations based on the user's profile and lifestyle.
*   `GET /recommend`: Get product recommendations for a specific product name.
*   `GET /routine/{user_id}`: Generate a daily skincare routine.
*   `POST /routine/{user_id}/adapt`: Adapt the skincare routine based on user feedback.
*   `POST /analyze-image`: Upload a photo, predict skin condition, and get targeted product recommendations.
*   `POST /skinmate`: Stream a response from the Llama 3 AI assistant using conversation history and profile context.
*   `POST /progress`, `GET /progress/{user_id}`: Log and retrieve progress check-ins (with image path and notes).

## How to Run the Project

### Prerequisites
*   Python 3.9+
*   Node.js 18+
*   PostgreSQL running locally
*   [Ollama](https://ollama.com/) installed

### 1. Start Ollama
Ensure Ollama is running in the background and you have pulled the Llama 3 model:
```cmd
ollama run llama3
```

### 2. Start the Backend
Open a command prompt (CMD), navigate to the project root, and set up the backend:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Make sure your `.env` file is configured with the correct database URL. Then start FastAPI:
```cmd
uvicorn app.main:app --reload
```
The backend runs on: `http://127.0.0.1:8000`
API documentation is available at: `http://127.0.0.1:8000/docs`

### 3. Start the Frontend
Open a new command prompt (CMD), navigate to the project root, and set up the frontend:
```cmd
cd frontend
npm install
npm run dev
```
Open the application in your browser at the URL provided by Vite (usually `http://localhost:5173`).

## Current Project Status

### Implemented
*   Authentication and Forgot Password.
*   Profile management (skin profile and lifestyle).
*   MobileNetV2 image classification for skin conditions.
*   Product recommendation using TF-IDF + Cosine Similarity.
*   7-day routine and adaptation.
*   SkinMate with Llama 3/Ollama and streaming.
*   Progress tracking and analysis history.
*   Tab-based dashboard.
*   Routine completion chart.
*   User Skin Report.

### Planned / Future Improvements
*   **Persistent SkinMate Chat History:** Storing SkinMate conversations in PostgreSQL across user sessions (currently handled via frontend in-session state).
*   **Persistent Routine Completion Data:** Storing routine completion data in PostgreSQL so completion survives refresh/logout/login.
*   **Long-term Routine History:** Using persisted routine completion data for a long-term 7-day routine completion chart/history.
*   **SkinMate Recommendation Integration:** Integrate SkinMate with the main recommendation system so SkinMate uses the same stored/retrieved recommended products.