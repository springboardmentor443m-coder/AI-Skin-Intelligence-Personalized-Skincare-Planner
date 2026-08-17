🩺 AI Skin Intelligence & Personalized Skincare Planner
========================================================

An AI-powered skin analysis and personalized recommendation platform that
combines a custom-trained deep-learning image classifier, tiered generative
AI (Google Gemini → Groq → local rule-based fallback), FastAPI, SQLite, and a
vanilla JavaScript frontend — turning a single uploaded photo into a
condition assessment, a 7-day checkbox-tracked skincare plan, product
recommendations, and a context-aware AI assistant.

> **Note — Technical Implementation**
> Skin condition assessment in this application uses a **MobileNetV2
> convolutional neural network trained from scratch** on a 6-class labeled
> image dataset (acne, blackheads, clear skin, dark spots, pores, wrinkles),
> not a rule-based computer-vision pipeline. The model reaches **95.82% test
> accuracy** (with test-time augmentation) on held-out data. All the same,
> assessments and recommendations are intended for informational and
> skincare-routine-planning purposes only — this is not a medical diagnostic
> tool, and it does not replace a dermatologist.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [Deep-Learning Skin Classification](#deep-learning-skin-classification)
  - [Personalized 7-Day Plan (Medical & Natural)](#personalized-7-day-plan-medical--natural)
  - [Checkbox-Tracked Task Completion](#checkbox-tracked-task-completion)
  - [Different Image → Different Plan](#different-image--different-plan)
  - [AI Skincare Chatbot](#ai-skincare-chatbot)
  - [Multi-Role Dashboards](#multi-role-dashboards)
  - [Ingredient Allergy Detection](#ingredient-allergy-detection)
  - [Skin Health Scoring Engine](#skin-health-scoring-engine)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Limitations](#-limitations)
- [Privacy & Data Handling](#-privacy--data-handling)
- [Future Enhancements](#-future-enhancements)

---

## 🔍 Overview

The AI Skin Intelligence & Personalized Skincare Planner is a full-stack web
application that transforms a photo into a personalized skincare routine.
A user uploads a facial image, a trained CNN classifies the visible skin
condition, and the platform generates a tailored 7-day plan, product
recommendations, and an AI assistant that can answer questions grounded in
that specific scan and the user's own profile.

**Application Processing Pipeline:**

```
User Uploads Facial Image
        │
        ▼
FastAPI Backend Endpoint (/api/v1/assess-skin/image)
        │
        ▼
MobileNetV2 CNN Inference (6-class softmax: acne, blackheads,
clearskin, darkspots, pores, wrinkles)
        │
        ▼
Predicted Condition + Confidence Score
        │
        ▼
Cross-checked against User's Stored Allergies (Ingredient Intelligence)
        │
        ▼
Scan Result Persisted (SQLite: scan_history)
        │
        ▼
7-Day Plan Generation (Gemini → Groq → Local Rule-Based Fallback)
        │
        ▼
Structured JSON Plan (Day 1-7, AM/PM tasks, each with a unique ID)
        │
        ▼
Frontend Renders Checkbox Checklist + Enables Plan-Aware Chatbot
        │
        ▼
Task Completion → Routine Adherence % → Skin Health Score (weighted formula)
```

---

## 🏗 System Architecture

```
┌─────────────────────────────┐
│         Frontend             │
│   index.html (vanilla JS)    │
│  Dashboard · Profile · Scan  │
│  Routine · Predict · Products│
│  Assistant · History         │
└───────────────┬───────────────┘
                │ REST (fetch, JWT bearer)
┌───────────────▼───────────────┐
│      FastAPI Backend          │
│         (main.py)             │
│  Auth · Profile · Assessment  │
│  Plan/Checklist · Chat        │
│  Dashboards · Reports         │
└───┬─────────────┬─────────────┘
    │             │
┌───▼────┐   ┌────▼─────────────┐
│ SQLite │   │  MobileNetV2 CNN │
│  (ORM  │   │ (best_mobilenetv2│
│  via   │   │   _model.keras)  │
│  SQLA- │   └──────────────────┘
│ lchemy)│
└────────┘
    │
┌───▼─────────────────────────────┐
│   Tiered AI Layer (per request)  │
│   1. Google Gemini API           │
│   2. Groq API (fallback)         │
│   3. Local rule-based (fallback) │
└───────────────────────────────────┘
```

---

## ✨ Key Features

### Deep-Learning Skin Classification
A MobileNetV2 CNN, trained via transfer learning with a two-phase fine-tune
(frozen backbone → unfrozen top layers at a reduced learning rate), data
augmentation, and class-weighting for imbalanced classes. Evaluated with
test-time augmentation for a final **95.82% test accuracy** across 6 classes.

### Personalized 7-Day Plan (Medical & Natural)
Every plan is generated fresh per scan, grounded in the predicted condition,
its confidence/severity tier, and the user's saved skin type. Two selectable
modes:
- **Medical** — real, named, purchasable products and active ingredients
  (salicylic acid, niacinamide, retinol, etc.)
- **Natural** — home-remedy alternative (tea tree oil, turmeric, aloe vera,
  multani mitti, etc.), explicitly framed as gentler and slower-acting than
  active ingredients, with a patch-test reminder

### Checkbox-Tracked Task Completion
Each AM/PM task in the 7-day plan has a unique ID and a persistent checkbox —
completion state is stored in the database (`task_completions`), survives
page reloads, and feeds directly into the routine-adherence component of the
Skin Health Score.

### Different Image → Different Plan
Nothing about the plan is a fixed template per condition class. The
predicted condition, its confidence (mapped to a severity tier), and the
user's stored skin type are all fed into the generation prompt (or the local
fallback's branching logic), so two different scans produce genuinely
different plans.

### AI Skincare Chatbot
A context-aware assistant available in two modes: ask questions about an
uploaded photo directly, or ask questions about your current 7-day plan
(e.g. *"why no retinol on Day 2?"*) without re-uploading anything — the
backend automatically includes your latest scan and stored plan as context.

### Multi-Role Dashboards
Role-based access control (`user`, `skincare_consultant`, `dermatologist`,
`administrator`) with separate dashboard endpoints: a personal dashboard for
regular users, a client-list view for consultants, a condition-distribution
view for dermatologists, and platform-wide analytics for admins.

### Ingredient Allergy Detection
Every scan result is cross-checked against the user's stored allergy list
(set via the Profile page). If a recommended active ingredient conflicts
with a listed allergy, a warning is surfaced directly in the response.

### Skin Health Scoring Engine
A weighted formula combining skin condition assessment (35%), lifestyle
habits (20%), sleep quality (15%), routine consistency (20%), and hydration
level (10%) into a single tracked score, with trend analysis
(improving/declining/stable) over time.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Backend framework | Python, FastAPI |
| Database / ORM | SQLite, SQLAlchemy |
| Authentication | JWT (PyJWT), bcrypt password hashing (passlib) |
| Deep learning | TensorFlow / Keras, MobileNetV2 (transfer learning) |
| Generative AI | Google Gemini API, Groq API |
| Image processing | Pillow, NumPy |
| Report export | ReportLab (PDF), openpyxl (Excel) |
| Frontend | HTML5, CSS3, vanilla JavaScript (no build tooling) |

---

## 📁 Project Structure

```
├── main.py                                          # FastAPI backend — routes, models, ML + AI logic
├── index.html                                        # Frontend single-page app
├── best_mobilenetv2_model.keras                       # Trained image classifier
├── image pipeline.ipynb                               # Notebook: data loading/preprocessing pipeline
├── server.ipynb                                       # Notebook: backend/API experimentation
├── skin_condition_classifier_mobilenetv2_trained.ipynb # Notebook: model training + evaluation
├── requirements.txt
├── .env                                                # API keys / secrets (see Environment Variables)
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📡 API Documentation

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/register` | POST | Register a new user (role-aware) |
| `/api/v1/auth/login` | POST | Log in, receive a JWT |
| `/api/v1/profile` | GET / POST | Read / save skin profile (age, type, concerns, allergies) |
| `/api/v1/assess-skin/image` | POST | Upload a photo → condition + confidence + allergy check |
| `/api/v1/assess-skin/7-day-plan` | POST | Generate structured plan (`plan_type=medical\|natural`) |
| `/api/v1/plan/latest` | GET | Fetch current plan + checklist completion state |
| `/api/v1/plan/task/toggle` | POST | Check / uncheck a single task |
| `/api/v1/plan/chat` | POST | Chat about the current plan (no photo needed) |
| `/api/v1/assess-skin/chat` | POST | Chat about an uploaded photo |
| `/api/v1/assess-skin/products` | POST | Personalized product recommendations |
| `/api/v1/assess-skin/predict-future-image` | POST | AI-generated projected-outcome image |
| `/api/v1/progress/log` | POST | Log a check-in, compute weighted Skin Health Score |
| `/api/v1/progress/trend` | GET | Improving / declining / stable trend over time |
| `/api/v1/dashboard/user` | GET | Personal dashboard |
| `/api/v1/dashboard/consultant` | GET | Client list (role-restricted) |
| `/api/v1/dashboard/dermatologist` | GET | Condition analytics (role-restricted) |
| `/api/v1/dashboard/admin` | GET | Platform analytics (role-restricted) |
| `/api/v1/reports/skin-health` | GET | Export history as PDF or Excel (`format=pdf\|excel`) |
| `/api/v1/history/scans` | GET | Full scan history |

Full interactive Swagger documentation is available at **`/docs`** once the
backend is running.

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/springboardmentor443m-coder/AI-Skin-Intelligence-Personalized-Skincare-Planner.git
cd AI-Skin-Intelligence-Personalized-Skincare-Planner

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables (see below)

# 5. Run the backend
uvicorn main:app --reload
```

Then open `index.html` directly in your browser — no build step required.
By default the frontend calls `http://127.0.0.1:8000/api/v1`; update the
`API_URL` constant near the top of `index.html`'s `<script>` block if your
backend runs elsewhere.

The trained model (`best_mobilenetv2_model.keras`) is already committed at
the repo root — `main.py` loads it directly, no additional setup needed.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET_KEY=replace-with-a-long-random-string
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

- Gemini key: aistudio.google.com/app/apikey
- Groq key: console.groq.com/keys
- Both AI keys are optional — the platform automatically falls back to a
  local rule-based engine for plans, chat, and recommendations if neither
  is reachable, so the app never fully breaks.

> ⚠️ If this repo's committed `.env` contains real keys, treat them as
> compromised (public repo = public keys) — rotate them and use your own
> local, git-ignored `.env` instead.

---

## ⚠️ Limitations

- Predictions come from a model trained on a limited, assembled dataset —
  not a clinical-grade diagnostic tool, and not validated against
  dermatologist-confirmed diagnoses.
- OAuth2 social login is not yet implemented (JWT email/password only).
- Not yet deployed to a live cloud environment — runs locally.
- The image-based chat and the plan-based chat are currently separate
  endpoints; unifying them so a single chat thread has both image and plan
  context is a planned improvement.
- No automated test suite yet.

---

## 🔒 Privacy & Data Handling

- Passwords are hashed with bcrypt — never stored in plain text.
- Uploaded images are processed for classification and are not shared with
  third parties beyond the configured AI provider (Gemini/Groq) when those
  tiers are used for chat or plan generation.
- All user data (profile, scan history, plans, progress logs) is stored
  locally in the SQLite database file shipped with this project — there is
  no external data warehouse in the current version.
- This application is not HIPAA-compliant and should not be used to store
  or process real protected health information in its current form.

---

## 🚀 Future Enhancements

- Unify the image-chat and plan-chat into a single context-aware thread
- OAuth2 social login
- Migrate from SQLite to PostgreSQL for production deployment
- Docker containerization + cloud deployment (AWS/Azure)
- Push/email notifications for routine and hydration reminders
- Before/after image comparison (SSIM + embedding similarity) for progress tracking
- Automated test suite (pytest)

