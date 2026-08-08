# AI Skin Intelligence – Personalized Skincare Planner

An AI-powered skincare application that analyzes a user's facial image and profile to generate personalized skincare recommendations and provide an interactive skincare chat experience.

## Features

- 🧠 Skin concern prediction using MobileNetV2
- 🤖 Personalized skincare recommendations using Google Gemini
- 💬 Context-aware skincare chat using Groq and Llama 3.3 70B
- ⚡ Streaming AI chat responses
- 👤 Personalized recommendations based on age, gender, skin type, budget, country, and additional details
- 🌐 React frontend with FastAPI backend

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Python
- FastAPI
- Pydantic
- PyTorch
- MobileNetV2

### AI
- Google Gemini
- Groq
- Llama 3.3 70B

## Architecture

React Frontend → FastAPI Backend → MobileNetV2 → Gemini → Recommendation

Recommendation → Chat Interface → Groq / Llama 3.3 70B → Streaming Response

## How It Works

1. User uploads a facial image and provides profile details.
2. MobileNetV2 predicts the top skin concerns.
3. Gemini generates a personalized skincare recommendation.
4. The recommendation is displayed in the frontend.
5. A chat interface becomes available after the recommendation is generated.
6. The user can ask questions about the recommendation.
7. The recommendation and user's question are sent to Groq.
8. Groq generates a response that is streamed back to the frontend.

## Running Locally

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

## Disclaimer

This application provides general skincare guidance and is not intended to replace professional medical or dermatological advice.
