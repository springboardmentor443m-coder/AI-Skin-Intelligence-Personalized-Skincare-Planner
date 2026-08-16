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

## 📋 Comprehensive System Workflow & Architectural Features


---

### 1. Onboarding & Baseline Diagnostic Intake (Visit 1)

The user journey begins by parameterizing their lifestyle profile and executing a baseline clinical vision assessment:

* **Profile Parameterization:** Users register or log in via the Streamlit UI, establishing demographic parameters and inputting lifestyle constraints, including Skincare Budget ($), Daily Water Intake Goal (L), and Target Sleep Schedule (Hours).
* **OpenCV Face Crop & Alignment:** A portrait image is uploaded and routed to the FastAPI backend. Haar Cascades (`cv2.CascadeClassifier`) detect facial boundaries, eliminate background interference, and crop/align the isolated face into a normalized 224×224 pixel tensor.
* **Keras Deep Learning Diagnostics:** The vision engine evaluates unscaled `float32` pixel tensors (0–255 range) through trained neural network weights (`skin_type_model.keras` and `skin_concern_model.keras`). `EfficientNetB0` classifies the core **Skin Type** (Normal, Oily, Dry, Combination).
* **Temperature-Scaled Probability Scoring ($T=0.45$):** `ConvNeXt-Tiny` evaluates the facial tensor across 7 clinical concern classes:
  * Redness
  * Acne
  * Clear Skin
  * Dark Spots
  * Pigmentation
  * Pores
  * Wrinkles
  
  Raw neural network logits are calibrated using Temperature Scaling ($T=0.45$) to generate human-readable percentage distributions.
* **YCrCb Morphological Blemish Analysis:** To eliminate false positives from ambient lighting shadows, the engine executes YCrCb color masking coupled with morphological black top-hat filtering (`cv2.MORPH_BLACKHAT`), isolating surface blemishes from illumination gradients.

---

### 2. Two-Stage ML E-Commerce Recommender (Zero Hallucination)

To prevent generative hallucination and ensure strict product feasibility, the platform relies on a closed-loop tabular machine learning pipeline:

* **Clinical Active Translation:** The primary vision defect is translated into targeted biochemical active ingredients (e.g., *Acne* $\rightarrow$ Salicylic Acid, Zinc PCA, Niacinamide).
* **Stage 1 (Candidate Retrieval):** The catalog (`final_skincare_v13_complete.csv`) is filtered to eliminate products exceeding the user's budget or flagged as unsafe for their skin type. A composite suitability score is computed by blending active ingredient TF-IDF cosine similarity (60% weight) with user profile vector similarity (40% weight).
* **Stage 2 (LightGBM Reranking):** The candidate pool is reranked using an offline-trained `LGBMRegressor` model, blending clinical suitability (75%) with real-world market engagement and rating metrics (25%).
* **Budget Dupes Matcher & Strict Rendering:** The Top 5 curated products are extracted alongside up to 3 cheaper alternative dupes matching the exact category and safety profile. Product metadata is rendered directly from the dataset:
  * **Brand Name**
  * **Product Name**
  * **Category/Type**
  * **Rating:** ⭐ 4.5 / 5.0
  * **Untruncated Ingredient List**
  * **Price ($) & Calculated Savings**

---

### 3. Generative LLM Routine Synthesis (7-Day AM/PM Plan)

Objective diagnostic and tabular product outputs are synthesized into an actionable weekly regimen:

* **Real-Time Context Bundling:** Patient demographics, vision probability metrics, lifestyle habits, and curated CSV product lists are compiled into an immutable zero-shot system prompt.
* **Dynamic Llama-3.3-70B Synthesis:** Powered by the Groq inference engine (`llama-3.3-70b-versatile`), the LLM structures a deeply descriptive, non-repeating 7-Day AM/PM routine strictly formatted as a structured JSON object.
* **Prescribed Clinical Targets:** Rather than mirroring current habits, the model analyzes baseline deficiencies and prescribes optimized clinical targets (e.g., transforming a current 5-hour sleep habit into an 8-hour target) embedded directly into the daily steps.
* **Strict Product Incorporation:** The LLM integrates the recommended CSV products, providing specific sequencing and layering instructions across morning and evening routines.

---

### 4. Longitudinal Progress Tracking & Adaptive Logic (Visit 2+)

Continuous clinical evaluation ensures routine effectiveness across subsequent visits:

* **Follow-Up Scan Comparison:** Follow-up portraits are processed through the identical OpenCV and Keras pipelines used during baseline intake.
* **Comparative Delta Matrix ($\Delta$):** The clinical shift is computed across all 7 concern classes:
  $$\Delta = \text{Follow-up } \% - \text{Baseline } \%$$
* **Automated Clinical Status Tagging:** Deltas are tabulated with automated progress flags:

| Status Flag | Condition Criteria | Clinical Meaning |
| :--- | :--- | :--- |
| **Improved ✅** | $\Delta \le -2.0\%$ (Defect) or $\Delta > 0\%$ (Clear Skin) | Significant barrier recovery |
| **Stable/Maintained 🌱** | $-2.0\% < \Delta \le 2.0\%$ | Controlled equilibrium |
| **Needs Attention ⚠️** | $\Delta > 2.0\%$ (Defect) or $\Delta < 0\%$ (Clear Skin) | Persistent or active concern |

* **Branched Adaptive Logic:**
  * **The Preventative Loop:** If **Clear Skin $\ge 85\%$**, the routine shifts to a preventative barrier-maintenance plan with no new active treatments.
  * **The Healing Loop:** If **Clear Skin $< 85\%$**, the system re-runs the Recommender Engine to target the newly identified primary concern.

---

### 5. Live AI Consultation (Dr. Twacha Chatbot)

A real-time, context-aware conversational agent for ad-hoc user inquiries:

* **In-Context System Injection:** User intake parameters, vision probability scores, and recommended CSV products are injected directly into the LLM context window, eliminating vector-database retrieval latency.
* **Interactive Dermatology Consultant:** Provides real-time answers regarding product layering, ingredient interactions, and lifestyle adjustments without hallucinations.
* **Session Memory Management:** Multi-turn conversational memory is preserved strictly in session state, with a dedicated **Clear Chat Memory** control to reset history upon logout.

---

### 6. Dynamic One-Click Re-Analysis Controls

* **State-Driven Recalibration:** When profile parameters (e.g., budget, water goal, sleep schedule) are modified in the sidebar, a single click on **🚀 Re-Analyze Skin with Updated Profile Parameters** re-executes recommendation filtering and routine synthesis instantly without requiring image re-upload.
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
│   ├── database.py  (SQLAlchemy ORM, SQLite Storage for Users & ScanRecords)
│   ├── llm_engine.py  (Groq LLM LLaMA 3.3 70B, Structured Routine JSON & Chatbot)
│   ├── main.py  (REST API Routes, Pydantic Schemas, CORS, Upload Handlers)
│   ├── recommender_engine.py  (TF-IDF Vectorizer, LightGBM Regressor, Dupes Matcher)
│   ├── vision_engine.py  (OpenCV Haar Crop, Keras Neural Models, YCrCb Top-Hat)
│   └── uploads/
├── frontend/ (Streamlit)
│   └── app.py  (Native Theme UI, Multi-Tab Workflow, Chatbot Interface)
├── requirements.txt
└── README.md
```
-----------

*Streamlit Web Application
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
