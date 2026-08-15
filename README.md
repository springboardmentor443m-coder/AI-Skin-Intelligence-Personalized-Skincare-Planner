# Skinly – AI Skin Intelligence & Personalized Skincare Planner

## Overview
Skinly is an AI-powered personalized skincare application that goes beyond generic advice. By combining computer vision for skin condition analysis and large language models (LLMs) for an intelligent skincare assistant, Skinly provides users with tailored skincare routines, product recommendations, and expert-like guidance. It aims to demystify skincare by dynamically adapting to a user's unique profile, lifestyle, and changing skin conditions.

## Key Features
*   **User Registration and Login:** Secure authentication to manage personal skincare journeys.
*   **Skin Profile Onboarding:** Detailed profiling including skin type, concerns, allergies, and sensitivity.
*   **Lifestyle Information:** Tracking sleep, water intake, stress, and diet to contextualize skincare needs.
*   **Personalized Skincare Routine:** Dynamic generation of daily skincare steps based on user profiles.
*   **Routine Adaptation:** Adjusting routines based on user feedback and changing needs.
*   **AI Skin Image Analysis:** Uploading an image to predict current skin conditions (e.g., acne, redness).
*   **Product Recommendations:** Targeted suggestions based on both the user's static profile and real-time image analysis.
*   **SkinMate AI Skincare Chatbot:** An intelligent assistant powered by Llama 3.
*   **Continuous SkinMate Conversation:** Chatbot maintains recent conversation context for fluid interactions.
*   **SkinMate Streaming Responses:** Real-time token streaming for a responsive chatbot experience.
*   **Edit My Profile:** Updating skin and lifestyle parameters at any time.
*   **Progress Tracking:** Basic progress logging with image and notes submission.

## AI / ML Components
Skinly utilizes several interconnected AI/ML systems to provide a personalized experience:
*   **Skin Condition Image Classification:** A TensorFlow-based model analyzes uploaded facial images to classify conditions like acne or redness.
*   **Product Recommendation System:** Uses machine learning (scikit-learn/pandas) to map identified conditions and skin profiles to specific active ingredients and products.
*   **Profile-Based Recommendations:** A rule-based and ML hybrid approach to suggest routines even without an image.
*   **SkinMate AI Chatbot:** Driven by **Llama 3** running locally via **Ollama**.
*   **Interaction:** The backend aggregates the user's profile, recent chat history, and current skin condition context into a comprehensive prompt, ensuring SkinMate's advice is safe, personalized, and context-aware.

## SkinMate Architecture
SkinMate operates as an advanced Retrieval-Augmented Generation (RAG)-style assistant tailored for skincare. Its current architecture:
1.  **Input:** User question + saved skin profile (type, allergies) + current skin check-in + recent conversation history.
2.  **Processing:** FastAPI receives the request and constructs a strict prompt with guardrails (e.g., avoiding allergy triggers, no medical diagnoses).
3.  **Inference:** The prompt is sent to a local **Ollama** instance running **Llama 3**.
4.  **Output:** Llama 3 generates the response, which FastAPI **streams** back to the frontend in real-time.

*Note: The current SkinMate chatbot processes text context only; it does not directly process or "see" uploaded images. Images are processed separately by the TensorFlow classification model.*

## Technology Stack
**Frontend:**
*   React (via Vite)
*   JavaScript / HTML / CSS

**Backend:**
*   FastAPI (Python)
*   SQLAlchemy & Pydantic
*   PostgreSQL (via psycopg2)
*   Uvicorn

**Machine Learning & AI:**
*   TensorFlow
*   scikit-learn, pandas, NumPy
*   Ollama (Local LLM Server)
*   Llama 3 (LLM)

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
*   **`skin_profile`**: Stores biological/dermatological data (age, gender, skin type, concerns, allergies, sensitivity).
*   **`lifestyle`**: Stores daily habits affecting skin health (sleep hours, water intake, stress, diet).
*   **`progress`**: Stores historical check-ins (image paths, notes) to track changes over time.

## API Overview
The FastAPI backend exposes several key endpoints (`/docs` for Swagger UI):
*   `POST /register` & `POST /login`: User authentication.
*   `GET/POST/PUT /skin-profile` & `/lifestyle`: Manage user data used for personalization.
*   `GET /routine/{user_id}`: Generate a daily skincare routine.
*   `POST /analyze-image`: Upload a photo, predict skin condition, and get targeted product recommendations.
*   `POST /skinmate`: Stream a response from the Llama 3 AI assistant using conversation history and profile context.
*   `POST /progress`: Log a new progress entry with notes and an image path.

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
*   End-to-end user onboarding and profile management.
*   Image-based skin condition classification and product recommendation.
*   Context-aware, streaming AI chatbot (SkinMate) running locally.
*   Dynamic routine generation and basic progress logging.

### Planned / Future Improvements
*   **Skin Score / Progress Charts:** Implementing a unified "Skin Score" metric and visual charts to track improvement over time.
*   **Persistent Chat History:** Storing SkinMate conversations in the database across user sessions (currently handled via frontend state).
*   **Enhanced Dashboard UI:** Further refinements to the user interface for tracking daily routine completion and displaying analytics.