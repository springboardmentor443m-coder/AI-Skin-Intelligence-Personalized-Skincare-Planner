# AI-Skin-Intelligence-Personalized-Skincare-Planner
# ✨ Twacha.ai | Intelligent Skincare Platform
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30%2B-FF4B4B.svg)](https://streamlit.io/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20LLaMA%203.3%2070B-orange.svg)](https://groq.com/)
[![Keras](https://img.shields.io/badge/Deep%20Learning-Keras%203%20%2B%20OpenCV-D00000.svg)](https://keras.io/)
[![LightGBM](https://img.shields.io/badge/ML%20Recommender-LightGBM%20%2B%20TF--IDF-green.svg)](https://lightgbm.readthedocs.io/)
> **Twacha.ai** is an end-to-end, full-stack AI-driven clinical skincare platform. It combines deep learning computer vision, two-stage machine learning product recommendations, real-time LLM dermatological care planning, and an interactive AI chatbot to deliver a world-class consumer healthcare experience.
---
## 🚀 Project Overview

Twacha.ai processes user facial portraits through custom-trained Convolutional Neural Networks (CNNs) to detect skin types and probability matrices for 7 distinct skin concerns. This vision data is fused with the user's real-time lifestyle metrics (age, budget, water intake, sleep) to power a dual-stage TF-IDF + LightGBM recommendation engine. Finally, a Groq-powered LLM synthesizes these insights into a dynamic, adaptive 7-Day AM/PM skincare routine.

## 🛠️ Tech Stack

**Frontend (Presentation Layer)**
* **Streamlit:** Interactive web interface, session state management, and tabbed routing.
* **Custom CSS:** Native light-theme UI for a clinical, professional aesthetic.

**Backend (Intelligence Layer)**
* **FastAPI:** High-performance asynchronous REST API routing.
* **SQLite & SQLAlchemy:** Lightweight local database for user profiles and longitudinal progress tracking.

**Machine Learning & Computer Vision**
* **TensorFlow / Keras:** Model inference (EfficientNetB0 for Skin Type, ConvNeXt-Tiny for Skin Concerns).
* **OpenCV:** Haar Cascade facial detection and automated 224x224 portrait cropping.
* **Scikit-Learn & LightGBM:** 60/40 TF-IDF Cosine Similarity and gradient boosting for product curation.

**Generative AI**
* **Groq API (Llama-3.3-70b-versatile):** In-context zero-shot prompting for generating personalized routines and powering the real-time AI Chat Consultant.

------


## 🗺️ System Architecture & Workflow



    A[User / Client] -->|Uploads Photo & Profile| B(Streamlit Frontend :8501)
    B -->|POST /api/scan/baseline| C{FastAPI Backend :8000}
    
    subgraph FastAPI Microservices
    C --> D[OpenCV Face Cropper]
    D --> E[Vision Engine: Keras CNNs]
    E --> F[SQLite Database]
    E --> G[Recommender Engine: TF-IDF]
    G --> H[Groq LLM Engine]
    end
    
    H -->|JSON Routine Payload| C
    C -->|Returns Rendered Data| B
    B -->|Displays Analytics & Plan| A
------------------------

📋 Step-by-Step Execution FlowIntake & Authentication: 
- Users register/login and set their demographic and lifestyle parameters (Budget, Water Goal, Sleep Target).
- Vision Diagnostics (Visit 1):A selfie is uploaded and routed to FastAPI.OpenCV detects the face, crops it to remove background noise, and normalizes the tensor.EfficientNetB0 classifies the Skin Type. ConvNeXt-Tiny evaluates 7 concern classes using temperature-scaled Softmax logits.
- Product Recommendation:The primary concern is mapped to clinical active ingredients.The TF-IDF engine vectorizes a catalog of skincare products, matching safe ingredients under the user's budget, outputting the Top 5 products + budget-friendly dupes.
- LLM Routine Synthesis:Llama-3.3-70B analyzes the vision metrics, product list, and lifestyle inputs to generate a highly descriptive, non-repeating 7-Day AM/PM routine strictly formatted in JSON.
- Progress Tracking (Visit 2+):The user uploads a follow-up photo. The system calculates the clinical Delta ($\Delta$) between the baseline and follow-up scans.
- Adaptive Logic: If "Clear Skin" > 85%, the system shifts to a preventative maintenance plan. If < 85%, it re-calibrates the recommendations for the remaining primary concern.

--------------------------


## 🌟 Key Features
### 📷 1. Instant Skin Health Scan (Visit 1)
- **OpenCV Face Crop & Alignment**: Automatically detects facial boundaries using Haar Cascades (`cv2.CascadeClassifier`) and resizes inputs to $224 \times 224$ pixels.
- **Keras Deep Learning Diagnostics**: Evaluates unscaled float32 pixel tensors ($0-255$) through trained Keras neural network models (`skin_type_model.keras` & `skin_concern_model.keras`).
- **Temperature-Scaled Probability Scoring ($T=0.45$)**: Maps raw logits across 7 clinical concern classes (*Redness, Acne, Clear Skin, Dark Spots, Pigmentation, Pores, Wrinkles*).
- **YCrCb Morphological Blemish Analysis**: Employs YCrCb skin region color masking and morphological black top-hat filtering (`cv2.MORPH_BLACKHAT`) to accurately distinguish localized dark spots/blemishes from global lighting gradients.
### 🛍️ 2. Two-Stage ML E-Commerce Recommender
- **Strict CSV Metadata Rendering**: Extracts products exclusively from `final_skincare_v13_complete.csv` to render **Brand Name**, **Product Name**, **Type/Category**, **Rating Norm** (`⭐ 4.5 / 5.0`), **Untruncated Ingredients List**, **Price ($)**, and **Calculated Savings**.
- **Stage 1 (Candidate Retrieval)**: Blends TF-IDF active ingredient cosine suitability ($60\%$) with user profile vector similarity ($40\%$) to retrieve top candidates matching skin type and budget limits.
- **Stage 2 (LightGBM Two-Stage ML Ranking)**: Reranks candidate pool using an offline `LGBMRegressor` model blending $75\%$ clinical suitability with $25\%$ market popularity metrics.
- **Budget Dupes Matcher**: Dynamically identifies and ranks up to 3 cheaper alternative products (dupings) matching the same product category and skin safety profile.
### 📅 3. Hyper-Personalized Adaptive 7-Day Care Plans
- **Real-Time LLM Synthesis**: Powered by Groq LLM (`llama-3.3-70b-versatile`), integrating user demographics (Age, Gender, Country, Budget), lifestyle habits (Water Intake $L$, Sleep Hours $h$), and ML vision analytics.
- **Prescribed Clinical Targets**: Analyzes current daily habits and prescribes new optimal clinical targets (e.g. current 5h sleep $\rightarrow$ prescribed 8h target) in daily routine steps.
- **Strict CSV Product Incorporation**: Schedules and instructs the exact application of all recommended CSV products across 7 days of non-repeating morning and evening routines.
### 📈 4. Clinical Progress Tracker & Comparative Delta Matrix
- **Follow-up Scan Comparison**: Compares follow-up portraits against baseline scans using identical OpenCV + Keras vision pipelines.
- **Net Delta Progress Table ($\Delta$)**: Displays structured markdown progress table:
  $$\Delta = \text{Followup \%} - \text{Baseline \%}$$
- **Automated Clinical Status Tagging**: Automatically tags concerns as `Improved ✅`, `Needs Attention ⚠️`, or `Stable/Maintained 🌱`.
### 💬 5. Dr. Twacha | Real-Time Dermatologist AI Chatbot
- **Interactive Conversational AI**: Answers any skin-related question, ingredient inquiry, or routine application query.
- **Real-Time Context Injection**: Automatically injects patient demographics, water/sleep habits, ML concern percentages, and matched CSV products into conversation context.
- **Session Memory Management**: Maintains multi-turn conversation memory for active sessions with a one-click `🗑️ Clear Chat Memory` reset option.
### 🔄 6. Dynamic One-Click Re-Analysis Controls
- Enables instant one-click routine and progress re-calibration (**`🚀 Re-Analyze Skin with Updated Profile Parameters`**) whenever profile habits are edited in the sidebar.
---
## 🏗️ System Architecture & Technology Stack
```
Twacha.ai Platform Architecture
│
├── 🎨 Frontend Layer (Streamlit)
│   ├── app.py (Native Theme UI, Multi-Tab Workflow, Chatbot Interface)
│
├── ⚡ Backend API Layer (FastAPI)
│   ├── main.py (REST API Routes, Pydantic Schemas, CORS, Upload Handlers)
│   ├── database.py (SQLAlchemy ORM, SQLite Storage for Users & ScanRecords)
│
├── 🧠 Intelligence & ML Engines
│   ├── vision_engine.py (OpenCV Haar Crop, Keras Neural Models, YCrCb Top-Hat)
│   ├── recommender_engine.py (TF-IDF Vectorizer, LightGBM Regressor, Dupes Matcher)
│   └── llm_engine.py (Groq LLM LLaMA 3.3 70B, Structured Routine JSON & Chatbot)
│
└── 📁 Data & Models Directory
    ├── models/ (Keras Models, Class JSON maps, OpenCV Haar XML)
    └── data/ (final_skincare_v13_complete.csv)
```
---
## 📋 Directory Structure
```
skincare_platform/
├── backend/
│   ├── data/
│   │   └── final_skincare_v13_complete.csv
│   ├── models/
│   │   ├── skin_type_model.keras
│   │   ├── skin_concern_model.keras
│   │   ├── skin_type_classes.json
│   │   ├── skin_concern_classes.json
│   │   └── haarcascade_frontalface_default.xml
│   ├── database.py
│   ├── llm_engine.py
│   ├── main.py
│   ├── recommender_engine.py
│   ├── vision_engine.py
│   └── uploads/
├── frontend/
│   └── app.py
├── requirements.txt
└── README.md
```
-----------

*Streamlit Web Application will open at: [http://127.0.0.1:8501](http://127.0.0.1:8501)*
---
## 📡 API Endpoints Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account with profile intake parameters |
| `POST` | `/api/auth/login` | Authenticate user account (SHA-256 + Plaintext support) |
| `PUT` | `/api/user/profile` | Update profile parameters (age, country, budget, water, sleep) |
| `POST` | `/api/scan/baseline` | Upload Visit 1 baseline photo, run vision ML, product match, & 7-day plan |
| `POST` | `/api/scan/followup` | Upload Visit 2+ follow-up photo, calculate progress deltas, & adapt routine |
| `POST` | `/api/chat/dermatologist` | Real-time AI Dermatologist chatbot with session context injection |
| `GET` | `/api/scans/{user_id}` | Retrieve historical scan records for a user |
---
## 📊 Diagnostic Metrics & Concern Classes
1. **Redness (Erythema Index)**
2. **Acne & Papules**
3. **Clear Skin Score (%)**
4. **Dark Spots (Hyper-pigmented Macules)**
5. **Pigmentation (Melanin Distribution)**
6. **Pores (Surface Pore Density)**
7. **Wrinkles (Fine Line Texture Variance)**
---

Disclaimer: Twacha.ai is an AI demonstration/ demo project and does not replace professional medical or dermatological advice.

-------------

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
---
## 🤝 Acknowledgments & Credits
- **Groq LLaMA 3.3 70B** for lightning-fast real-time inference.
- **Keras & TensorFlow** for deep learning vision modeling.
- **OpenCV** for computer vision image processing & morphological analysis.
- **Streamlit & FastAPI** for backend and frontend web infrastructure.
