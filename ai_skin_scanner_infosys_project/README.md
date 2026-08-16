# Aetheris AI: Skin Intelligence & Personalized Skincare Planner

Aetheris AI is a clinical-grade, web-based software-as-a-service (SaaS) platform that leverages deep learning computer vision and generative AI to diagnose patient skin profiles and compile custom, targeted skincare routines.

---

## 1. Core Platform Features

- **Custom CNN Skin Classifier**: Uses a custom-trained convolutional neural network (CNN) built in TensorFlow/Keras to analyze facial photographs and classify skin into 5 primary categories: Oily, Dry, Normal, Sensitive, and Combination.
- **Hybrid Pixel Feature Extractor**: Combines the spatial features of the CNN classifier with pixel-level computer vision statistics (RGB color ratio, specular shine highlights, grayscale luminance contrast, and Sobel edge detection) to calculate highly accurate, image-specific concern percentages (Acne, Redness, Hyperpigmentation, Dryness, and Fine Lines) for every upload.
- **Biometric Scan History**: Logs every dermal scan session under the user's email into a persistent MongoDB database. The historical log allows patients to track variations in their Skin Health Index over time and reopen old reports.
- **AI Skincare Consultant Chat**: A conversational clinical assistant powered by  ollama  that references the patient's active biometric scan reports to answer questions about active ingredients, routines, and specific dermatological issues.
- **Interactive Routine Planner**: Generates a dynamic 7-day, day-by-day morning and evening routine targeting the patient's primary skin concern (e.g. "Acne & Pore Congestion Treatment Protocol") with interactive checkboxes.
- **Product Recommendation Engine**: Recommends clinical skincare products with matching, high-quality cosmetic photographs corresponding to the exact category (Cleanser, Serum, Moisturizer, SPF).

---

## 2. Technology Stack: What We Used & Why

### 2.1 React + TypeScript + Vite (Frontend)
- **What**: React is used for modular component architectures, Vite is used as the high-speed build tool, and TypeScript enforces strict static type safety.
- **Why**: 
  - **Aesthetics & Speed**: Vite provides instantaneous Hot Module Replacement (HMR) for visual design iteration.
  - **Reliability**: TypeScript checks all interfaces (like `ScanMetrics` and `UserProfileData`), preventing runtime exceptions during state transitions.
  - **Bento Grid Layouts**: Custom Vanilla CSS combined with Tailwind utilities makes it easy to build a premium, glassmorphism-based clinical dashboard.

### 2.2 Python + Flask (Backend Server)
- **What**: Flask is a micro-web framework used to set up REST API endpoints.
- **Why**: 
  - **TensorFlow Integration**: Python is the native environment for deep learning. Flask allows us to quickly route base64 image strings directly into the Keras model.
  - **Lightweight Overhead**: Avoids complex boilerplate, running on port `5000` with native CORS support.

### 2.3 MongoDB (Database)
- **What**: A NoSQL document-based database.
- **Why**:
  - **Schema Flexibility**: Skincare analysis metrics change frequently as we add features. MongoDB stores nested JSON metrics alongside base64 image strings without requiring complex migration scripts.
  - **Query Performance**: Extremely fast document indexing on user emails to pull historical logs.

### 2.4 Custom CNN Model & Ollama API (Artificial Intelligence)
- **What**: A custom convolutional neural network (CNN) trained on skin type datasets, paired with the **Ollama** Large Language Model (LLM).
- **Why**:
  - **Spatial Feature Recognition**: CNNs excel at detecting local spatial structures (pores, oil shine, redness) in raw uploaded images.
  - **Conversational Reasoning**: Ollama provides expert clinical-grade skincare agent personas, formatting complex skincare guidelines and 7-day tables into clean JSON and text structures instantly.

### 2.5 Which LLM is Used & How the Recommendation Pipeline Works

#### **Which LLM is Used?**
We use the **Ollama** model (`models/Ollama`) via the official Ollama AI REST API endpoint. We chose **Ollama qwen2.5:7b** because it is extremely fast, highly cost-effective, and natively supports **Structured JSON Outputs** (ensuring the model returns a valid JSON matching our database format, instead of conversational text).

#### **How the Recommendation Pipeline Works:**
1. **Dermal Scan & Capture**: When you upload an image, our custom CNN and pixel feature extractors analyze your skin, calculating metrics for Acne, Dark Spots, Whiteheads, Redness, and overall Skin Type (e.g. Oily, Dry).
2. **LLM Prompt Compilation**: The backend server compiles a detailed clinical prompt containing all these numeric metrics and skin condition statuses.
3. **Structured JSON Mode Call**:
   - The Flask server sends a `POST` request containing the compiled prompt to the Ollama API.
   - We set the `"responseMimeType": "application/json"` parameter in the API payload. This forces Gemini to respond strictly in a valid JSON format conforming to our requested structure.
4. **Target Schema Structure**:
   Gemini is instructed to return a structured JSON matching:
   ```json
   {
     "summary": "Clinical summary of skin condition",
     "products": [
       { "category": "Cleanser", "name": "Recommended product", "brand": "Brand", "reason": "Why" }
     ],
     "routine_7_day": {
       "Monday": { "morning": ["Step 1", "Step 2"], "evening": ["Step 1", "Step 2"] },
       ...
     }
   }
   ```
5. **Robust Parsing & Client Render**: The backend extracts the text from the first `{` to the last `}` (guaranteeing invalid wrappers are stripped), parses it into a JSON object, and sends it to the React frontend. The frontend automatically displays:
   - Dynamic product list with matching cosmetic photos.
   - 7-Day calendar planner showing morning/evening steps.

---

## 3. Installation & Run Instructions

### Prerequisites
- Install [Node.js](https://nodejs.org/) (v16 or higher)
- Install [Python 3.10+](https://www.python.org/downloads/)
- Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and ensure it is running on `mongodb://localhost:27017`
- **Optional (Local Free LLM)**: Install [Ollama](https://ollama.com/) to run the chatbot and recommendation pipeline completely offline and keylessly. Download a model by running `ollama pull llama3` or `ollama pull qwen2.5` in your terminal. Our backend auto-detects and uses whichever model is active!

---

### Step 1: Run the Backend Flask Server
1. Navigate to the project root directory:
   ```bash
   cd c:\Users\prave\OneDrive\Documents\ai_skin_scanner_infosys_project
   ```
2. Install Python dependencies:
   ```bash
   pip install tensorflow numpy flask flask-cors pillow pymongo
   ```
3. Run the Flask server:
   ```bash
   python -u server.py
   ```
   *Note: The server will connect to MongoDB, load the trained `skin_type_model.keras` file, and listen on `http://localhost:5000`.*

---

### Step 2: Run the Frontend Application
1. Open a new terminal in the project root directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Note: Open the application at the URL output by Vite (usually `http://localhost:5175`).*

---

## 4. User Guide: How to Test the System

1. **User Authentication**:
   - Register a new account with your email. Authentication hashes passwords and stores user documents inside MongoDB.

2. **Perform a Skin Scan**:
   - Navigate to **AI Skin Scan**.
   - Upload any face photograph.
   - Click **Start Dermal Analysis**. The scanner will send the image to Flask, calculate pixel-level statistics, save the record to MongoDB, and open your clinical report.
3. **Track History**:
   - Go to **Scan History** in the sidebar. You will see a chronological log of all your uploads, complete with thumbnails and scores. Click **View Report** on any card to recall old details.
4. **View Routines**:
   - Open **Routine Planner** to view your active disease protocol and check off morning/evening steps.

---

## 5. Codebase Components Breakdown (For Mentor Reference)

This section maps each frontend UI screen component and backend script to its corresponding technical purpose, facilitating code review.

### 5.1 Frontend Screens & Components (`src/`)

#### Central Coordinators
* **[App.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/App.tsx)**:
  - The core entry component. Orchestrates routing states, user authentication sessions, and shares states (e.g. active profile data and scan metrics) across all child pages.
* **[Sidebar.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/components/Sidebar.tsx)**:
  - Renders the primary navigation links. Integrates a logout callback and displays the current user profile summary at the bottom.
* **[Header.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/components/Header.tsx)**:
  - Top navigation bar. Houses dark mode context triggers and holds the real-time clinical alerts notifications panel.

#### Dashboard & Scanner Screens
* **[Dashboard.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/Dashboard.tsx)**:
  - Renders the home bento grid. Incorporates a dynamic SVG gauge for health scores, a vertical Targeted Recommendations module, routine checklists, an SVG vector trend chart mapping moisture/elasticity, and water intake counters.
* **[CameraScan.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/CameraScan.tsx)**:
  - Handles image uploads. Renders the camera stream interface on the left and the **Dermal Lifestyle Profile form** (Sun exposure, Goals, Sensitivity, Actives habits) on the right.
* **[AnalysisResults.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/AnalysisResults.tsx)**:
  - Opens immediately on scan completion. Displays severity progress metrics (Acne, Hyperpigmentation, Redness, Fine Lines, Sebum) and calls the Flask backend to request Gemini's clinical 7-day routine.

#### Planners & Utilities
* **[SkincareRoutine.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/SkincareRoutine.tsx)**:
  - Displays the 7-day protocol. Uses calendar date matching (`new Date().getDay()`) to automatically select and focus on the current day's routine steps.
* **[ProgressTracking.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/ProgressTracking.tsx)**:
  - Queries MongoDB scan history to draw a dynamic, custom SVG progress trend line. Uses current system dates to display chronological evaluation logs.
* **[ProductRecommendations.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/ProductRecommendations.tsx)**:
  - Real-time product store holding **210 dynamic items**. Implements matching algorithms evaluating compatibility scores (60% skin type + 40% severity concern) and matches photography categories dynamically.
* **[ConsultantChat.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/ConsultantChat.tsx)**:
  - Fully offline/online chat. Pass user profiles (Name, Email) and biometric scores to the backend to get highly personalized consulting.
* **[Ingredients.tsx](file:///c:/Users/prave/OneDrive/Documents/ai_skin_scanner_infosys_project/src/screens/Ingredients.tsx)**:
  - Matches cosmetic ingredients (like *Salicylic Acid*, *Alcohol*) against a chemical toxicity index to label them Safe, Caution, or Alert.

### 5.2 Backend APIs (`server.py`)

* **`POST /api/scan`**:
  - Preprocesses face photographs, passes them through the TensorFlow CNN (`skin_type_model.keras`) to determine skin type, and extracts local features (redness masking, contrast standard deviation, Sobel edge detectors) for secondary scores. Inserts the completed record into MongoDB.
* **`POST /api/consultant/recommendations`**:
  - Compiles skin type and lifestyle questionnaire options into a structured system prompt, calls Gemini/Ollama, parses the structured JSON payload containing the custom products list and 7-day protocol, and returns it to the client.
* **`POST /api/consultant/chat`**:
  - Context-aware chatbot endpoint. Feeds client details (Name, Email, History, Biometrics) to the LLM, and implements local keyword-matching NLP rules offline as a Tier-3 backup.
* **`GET /api/scan/history`**:
  - Retrieves all historical documents logged under the user's email address from MongoDB, sorted descending by timestamp.
