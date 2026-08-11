# 🌸 AI Skin Intelligence & Personalized Skincare Planner

An AI-assisted skincare analysis and personalized recommendation application that combines OpenCV-based facial feature extraction, FastAPI, Google Gemini LLM, SQLite, and a Vanilla JavaScript frontend.

> [!NOTE]
> **Technical Implementation Disclaimer:** The facial analysis in this application is based on **computer-vision feature extraction and rule-based calculations using OpenCV**, not a trained deep-learning facial-skin dataset or medical diagnostic ML model. All assessments and product recommendations are intended for informational and skincare routine-planning purposes only.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [OpenCV Facial Analysis](#-opencv-facial-analysis)
  - [Personalized Product Recommendation Engine](#-personalized-product-recommendation-engine)
  - [Different Image → Different Recommendation](#-different-image--different-recommendation)
  - [New Image & Session Reset](#-new-image--session-reset)
  - [AI Skincare Chatbot](#-ai-skincare-chatbot)
  - [Multi-Role Dashboard](#-multi-role-dashboard)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Limitations](#-limitations)
- [Privacy & Data Handling](#-privacy--data-handling)
- [Future Enhancements](#-future-enhancements)

---

## 🔎 Overview

The **AI Skin Intelligence & Personalized Skincare Planner** is a full-stack web application designed to transform digital facial photos into customized skincare routines. By processing uploaded facial images through deterministic computer vision algorithms, the application extracts objective surface feature metrics, calculates a holistic health index, dynamically ranks product catalog items, and enables scan-aware consultation with an AI chatbot.

### Application Processing Pipeline:
```text
User Uploads Facial Image
        │
        ▼
FastAPI Backend Endpoint (/api/assess)
        │
        ▼
OpenCV Facial Feature Extraction (Laplacian, LAB/HSV/Sobel Filters)
        │
        ▼
Extracted Skin Metrics & Estimated Profile
        │
        ▼
Current Scan Stored in Frontend State (state.currentScan)
        │
        ▼
Dynamic Catalog-Wide Product Suitability Analysis
        │
        ▼
Personalized Product Scoring & Ranking
        │
        ▼
Rendered Tailored Skincare Recommendations
        │
        ▼
Google Gemini-Powered Skincare Consultant Chat Assistant
```

---

## 🏗️ System Architecture

### 1. Computer Vision & Recommendation Flow
```text
User Image File
       │
       ▼
Frontend File Uploader (js/app.js)
       │
       ▼  HTTP POST /api/assess
FastAPI Web Server (backend/main.py & assessment_router.py)
       │
       ▼
OpenCV Feature Analyzer (backend/ml_model.py)
 ├── Haar Cascade Face ROI Detection
 ├── Forehead Laplacian Variance (Texture & Wrinkles)
 ├── LAB Color Space Std Dev (Pigmentation Evenness)
 ├── HSV Red-Hue Pixel Ratio (Blemish & Active Spots)
 ├── Luminance Mean & Contrast Ratio (Moisture & Radiance)
 ├── Sobel High-Frequency Edge Energy (Cheek Pore Refinement)
 └── CIELAB a* Channel Erythema Offset (Redness & Sensitivity)
       │
       ▼ Returns JSON Metrics & Scan ID
Single Source of Truth State (state.currentScan)
       │
       ▼
Dynamic Scoring Engine (js/routine_generator.js)
       │
       ▼ Evaluates Entire Available Catalog
Product Catalog (window.SKIN_DATA.PRODUCTS in js/sample_data.js)
       │
       ▼
Ranked Products Array (Sorted by Suitability Score Descending)
       │
       ▼
Rendered Recommendation Cards (#product-recommendations-grid)
```

### 2. AI Chatbot Session Flow
```text
User Skincare Question
       │
       ▼
Frontend Chat Handler (js/app.js)
       │
       ▼  HTTP POST /api/chat (session_id + scan_id + currentScan metrics)
FastAPI Chat Router (backend/routers/chat_router.py)
       │
       ▼ Constructs System Context Prompt
Google Gemini Generative AI SDK (google.generativeai)
       │
       ▼ Returns Scan-Aware Contextual Response
Rendered Consultant Chat Message
```

---

## ✨ Key Features

### 📸 OpenCV Facial Analysis
The image analysis engine ([`backend/ml_model.py`](file:///C:/Users/chinn/.gemini/antigravity/scratch/skin_intelligence_app/backend/ml_model.py)) extracts six key surface metrics from detected facial Regions of Interest (ROI):

| Skin Metric | OpenCV & NumPy Technique | Description & Formula |
| :--- | :--- | :--- |
| **`wrinkle_clarity`** | `cv2.Laplacian` | Evaluates variance of Laplacian edge intensity on forehead ROI. Higher texture variance lowers clarity score. |
| **`pigmentation_evenness`** | LAB Color Space `L*` | Calculates standard deviation of Lightness (`spot_std = np.std(l_chan)`) across face ROI to measure tone uniformity. |
| **`blemish_clarity`** | HSV `cv2.inRange` | Applies red-hue pixel masks (`lower_red` & `upper_red`) to compute blemish surface area ratio (`red_ratio`). |
| **`moisture_barrier`** | Luminance & Contrast | Evaluates mean luminance (`mean_l = np.mean(l_chan)`) relative to lightness standard deviation to assess skin radiance. |
| **`pore_refinement`** | Sobel Gradient Energy | Applies `cv2.Sobel` high-frequency edge filter on cheek ROIs to measure pore edge texture energy (`pore_energy`). |
| **`calmness_sensitivity`** | CIELAB `a*` Channel | Measures average `a*` channel offset above neutral gray (`128.0`) to calculate erythema index. |
| **`estimated_age`** | Texture Feature Formula | `bio_age = 21.0 + (lap_factor * 0.6) + (spot_factor * 0.4) + (pore_factor * 0.3)` |
| **`skin_type`** | Rule-Based Decision Tree | Categorizes skin into `Dry & Sensitive`, `Oily & Blemish-Prone`, `Normal / Balanced`, or `Combination Skin`. |

---

## 🎯 Personalized Product Recommendation Engine

### Static Product Catalog vs. Dynamic Recommendation List
- **STATIC PRODUCT CATALOG**: Predefined list of available products containing structural metadata in `window.SKIN_DATA.PRODUCTS` ([`js/sample_data.js`](file:///C:/Users/chinn/.gemini/antigravity/scratch/skin_intelligence_app/js/sample_data.js)).
- **DYNAMIC RECOMMENDATION SELECTION**: The final recommendation list is **never hardcoded**. Every product in the catalog is evaluated and scored dynamically against `state.currentScan`.

### Metric Concern Intensity Mapping
Quality metric scores range from `0` to `100` where higher scores indicate optimal skin clarity. The engine converts these into **Concern Intensities**:

$$\text{Concern Intensity} = 100 - \text{Metric Score}$$

- Low `moisture_barrier` (e.g. 30) $\rightarrow$ High Dryness Concern (70/100) $\rightarrow$ Prioritizes barrier creams & ceramides.
- Low `blemish_clarity` (e.g. 30) $\rightarrow$ High Blemish Concern (70/100) $\rightarrow$ Prioritizes BHA cleansers & Salicylic Acid.
- Low `pore_refinement` (e.g. 30) $\rightarrow$ High Pore Concern (70/100) $\rightarrow$ Prioritizes Niacinamide & Zinc sebum gels.
- Low `calmness_sensitivity` (e.g. 35) $\rightarrow$ High Redness Concern (65/100) $\rightarrow$ Prioritizes Cica calming washes & mineral SPFs.

### Personalized Scoring Calculation

```javascript
let score = 25; // Base starting score

// 1. Concern Intensity Weighting (Primary factor: up to +50 points)
product.targetConcerns.forEach(c => {
    const intensity = concernIntensities[c] || 0;
    if (intensity > 20) score += Math.round(intensity * 0.50);
    else score -= 10; // Penalty for targeting unneeded concerns
});

// 2. Skin Type Compatibility (+20 / -15)
if (skinTypeMatch) score += 20;
else if (targetTypes.length > 0) score -= 15;

// 3. Age Profile Compatibility (+10 / -10)
if (ageCategoryMatch) score += 10;
else score -= 10;
```

---

## 🔄 Different Image → Different Recommendation

Each uploaded image produces an isolated scan result in `state.currentScan`:

```text
IMAGE A
  └─ OpenCV Analysis A
      └─ Scan A (Dry & Sensitive, Low Moisture 30)
          └─ Product Scoring A
              └─ Ranked Recommendations A (#1 Ceramide Cream, #2 Cica Foam)

IMAGE B
  └─ OpenCV Analysis B
      └─ Scan B (Oily & Blemish-Prone, Low Blemish 30)
          └─ Product Scoring B
              └─ Ranked Recommendations B (#1 Clarifying Wash, #2 Sebum Gel)
```

- **Note on Overlap**: If two uploaded images exhibit similar skin feature metrics, their product recommendations may legitimately overlap. However, when images possess different concerns, the ranking responds accordingly.

---

## 🔄 New Image & Session Reset

When a user drops or selects a new photo, `resetForNewImageScan()` in [`js/app.js`](file:///C:/Users/chinn/.gemini/antigravity/scratch/skin_intelligence_app/js/app.js#L151) executes a 3-level purge:

1. **Frontend State**: Sets `state.currentScan = null`, resets current message history, and clears `#product-recommendations-grid`.
2. **Browser Storage**: Purges `localStorage` and `sessionStorage` keys (`skin_intel_chat_session_id`, `skin_intel_chat_messages`).
3. **Backend Server DB**: Triggers `DELETE /api/chat/session/{session_id}` to delete previous conversation records from the database.

---

## 💬 AI Skincare Chatbot

- **Integration**: Integrated with **Google Gemini LLM** via FastAPI router (`/api/chat`).
- **Context Awareness**: Receives `scan_id`, `estimated_age`, `skin_type`, `overall_score`, and the 6 metrics in every API request.
- **Session Binding**: Chat sessions are bound strictly to `state.currentScan.scanId`. Selecting a new image automatically starts a new session with 0 history leakage.

---

## 👥 Multi-Role Dashboard

The interface adapts dynamically based on the active role selected in the navigation header:

### 1. User View
- Facial photo upload dropzone and camera capture.
- Holistic Skin Vitality Index score circle (0–100) and weighted factor breakdown.
- 6 Facial feature observation cards with progress bars.
- Dynamic Age-Tailored Product Recommendations grid.
- Morning, Afternoon, Evening, and Weekly care ritual checklists.
- Gemini AI Skincare Consultant assistant.

### 2. Consultant View
- Client roster table monitoring client names, health indices, age groups, primary focus areas, and consultation dates.

### 3. Dermatologist View
- Clinical observation cards displaying detailed health grading, barrier health notes, and customized clinical impressions.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) | Single-Page Interface, Glassmorphism UI, Responsive CSS Grid |
| **Backend** | Python 3.10+, FastAPI, Uvicorn | Async REST API Server, Static File Serving, CORS Middleware |
| **Computer Vision** | OpenCV (`opencv-python`), NumPy, Pillow | Face Detection, LAB/HSV/Sobel Feature Extraction |
| **AI Chatbot** | Google Gemini API (`google-generativeai`) | Scan-Aware Skincare Consultant Chat Assistant |
| **Database & ORM** | SQLite, SQLAlchemy, Pydantic | Schema Definition, Data Persistence, API Payload Validation |
| **Authentication** | Passlib, PyJWT (`python-jose`) | Password Hashing & JWT Bearer Token Authentication |

---

## 📁 Project Structure

```text
skin_intelligence_app/
├── index.html                 # Main single-page web application interface
├── css/
│   └── styles.css             # Vanilla CSS design system, typography & theme tokens
├── js/
│   ├── app.js                 # App state, API handlers, upload dropzone & grid renderer
│   ├── routine_generator.js   # Dynamic product suitability engine & routine planner
│   ├── scoring_engine.js      # Overall Skin Vitality Index health scoring engine
│   └── sample_data.js         # Product catalog, concern taxonomy & client profiles
├── backend/
│   ├── main.py                # FastAPI initialization & static directory mounting
│   ├── config.py              # Configuration settings & API key management
│   ├── database.py            # SQLite SQLAlchemy engine & session factory
│   ├── models.py              # Database ORM models (User, SkinAssessment, ChatMessage)
│   ├── schemas.py             # Pydantic request/response validation models
│   ├── auth.py                # Password hashing & JWT token validation
│   ├── ml_model.py            # OpenCV feature extraction analyzer
│   ├── routers/
│   │   ├── assessment_router.py # POST /api/assess & GET /api/assessments
│   │   ├── chat_router.py       # POST /api/chat & DELETE /api/chat/session/{id}
│   │   └── auth_router.py       # POST /api/auth/register & POST /api/auth/token
│   └── uploads/               # Directory for uploaded and annotated face images
├── scratch/
│   ├── test_flow.py           # Multi-turn chat & session deletion integration test
│   ├── test_recommendations.py# Dynamic recommendation personalization test
│   └── test_scoring.js        # Node.js scoring differentiation test
└── README.md                  # Project documentation
```

---

## 🔌 API Documentation

### Key Endpoints

#### 1. Upload & Analyze Skin Image
`POST /api/assess`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (Image file: JPEG, PNG, WEBP)
- **Response**:
  ```json
  {
    "id": 1,
    "scan_id": "scan_a887c4e5540a",
    "estimated_age": 22,
    "skin_type": "Oily & Blemish-Prone",
    "overall_score": 73.2,
    "metrics": {
      "wrinkle_clarity": { "score": 95.0, "status": "Optimal" },
      "pigmentation_evenness": { "score": 95.0, "status": "Optimal" },
      "blemish_clarity": { "score": 30.0, "status": "Active Areas" },
      "moisture_barrier": { "score": 71.8, "status": "Dehydrated" },
      "pore_refinement": { "score": 45.0, "status": "Visible Pores" },
      "calmness_sensitivity": { "score": 56.2, "status": "Reactive" }
    },
    "original_image_url": "/uploads/orig_abc123.jpg",
    "annotated_image_url": "/uploads/annotated_xyz789.jpg"
  }
  ```

#### 2. Chat with AI Consultant
`POST /api/chat`
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "session_id": "chat_session_scan_a887c4e5540a",
    "message": "What products work best for my scan?",
    "scan_id": "scan_a887c4e5540a",
    "estimated_age": 22,
    "skin_type": "Oily & Blemish-Prone",
    "overall_score": 73.2,
    "metrics": { ... }
  }
  ```

#### 3. Delete Server Chat Session
`DELETE /api/chat/session/{session_id}`
- **Response**: `{ "status": "success", "message": "Session deleted." }`

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Python 3.10+**
- **pip** package manager

### 2. Environment Setup
```bash
# Navigate to project root directory
cd skin_intelligence_app

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install required dependencies
pip install fastapi uvicorn opencv-python numpy pillow sqlalchemy pydantic python-multipart google-generativeai python-jose passlib
```

---

## 🔐 Environment Variables

Configure your Google Gemini API key as an environment variable before starting the backend:

```bash
# Windows PowerShell:
$env:GEMINI_API_KEY="your_gemini_api_key_here"

# Linux / Mac:
export GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## ⚠️ Limitations

- **OpenCV Heuristics**: Analysis uses signal-processing feature extraction (Laplacian variance, color space standard deviation, hue masks), not a medically trained deep neural network.
- **Lighting & Pose Sensitivity**: Image lighting, camera resolution, shadows, and face angle directly influence extracted pixel metrics.
- **Non-Diagnostic**: The application provides cosmetic skincare routine recommendations and is **not a medical device**. It should not replace professional dermatological advice.
- **Algorithmic Estimated Age**: Estimated skin age is an algorithmic calculation derived from surface texture and contrast factors, not a person's confirmed biological age.

---

## 🔒 Privacy & Data Handling

- **Local Storage**: Uploaded image files and annotated bounding-box overlays are stored locally in `backend/uploads/`.
- **Database Persistence**: SQLite database (`backend/skin_intelligence.db`) stores user assessments, metrics, and chat history locally.
- **Session Purge**: Selecting a new image calls `DELETE /api/chat/session/{session_id}` to purge previous conversation records from the database.

---

## 🚀 Future Enhancements

- Deep-learning classification model trained on annotated facial skin datasets (ISIC/DermNet).
- MediaPipe Face Mesh landmark alignment for accurate anatomical zone masking.
- Automatic white-balance and lighting normalization prior to feature extraction.
- Expanded evidence-based product catalog with clinical ingredient interaction checks.
- Native mobile applications (iOS / Android).

---

## 📌 Disclaimer

> [!CAUTION]
> **Medical Disclaimer**: This software is designed for personal skincare routine organization and educational demonstration purposes only. It does not provide medical diagnoses, treatment advice, or dermatological prescriptions. Users with persistent skin conditions, severe acne, or unusual lesions should consult a licensed healthcare professional.