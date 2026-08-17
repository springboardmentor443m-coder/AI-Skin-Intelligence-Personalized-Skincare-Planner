# AI Skin Intelligence & Personalized Skincare Planner

An advanced, end-to-end AI-powered diagnostic and personalized skincare scheduling application. The project leverages custom deep learning models (PyTorch) to analyze facial photographs, classify skin types and concerns, and generate a dermatologist-approved 7-day skincare routine populated with real, gender-aware, and budget-filtered products from an e-commerce dataset of 960+ items.

---

## 🌟 Key Features

### 1. AI Facial Diagnostics (Deep Learning)
* **Dual PyTorch Classifiers**: Analyzes face images using custom-trained **EfficientNet-B0** convolutional neural networks.
* **Skin Type Detection**: Classifies skin into 5 categories: *Oily, Dry, Normal, Combination, and Sensitive*.
* **9-Point Skin Concern Analysis**: Predicts probabilities for *Acne, Wrinkles, Dryness, Redness, Dark Spots, Dark Circles, Large Pores, Oiliness, and Normal skin*.
* **Scan Input Options**: Real-time WebRTC camera snapshot (biometric reticle scanner overlay) or file upload.

### 2. Personalization & Gender-Aware Regimen Matching
* **Dermatologist Recommended Products**: Recommends a 4-step routine: *Cleanser, Active Treatment Serum, Moisturizer, and Sunscreen*.
* **Gender-Aware Recommendations**: Integrates user profile gender selection (*Male, Female, Unisex*) to filter and suggest gender-specific products (e.g., Men's oil-control vs Women's radiance lines).
* **Budget Tier Filtering**: Filter matching products dynamically by price brackets:
  * `All Price Tiers`
  * `💸 Budget-Friendly (< ₹500)`
  * `💳 Mid-Tier (₹500 - ₹1500)`
  * `👑 Premium (> ₹1500)`
* **Total Monthly Cost Calculator**: Computes estimated monthly skincare routine cost.
* **Dataset Alternative Browser**: A toggleable down arrow catalog to view all additional unique matches from the 960+ product dataset, automatically filtered to exclude duplicate matches from the top 4 recommendations.

### 3. Dr. DermAI Clinical Chatbot Assistant
* **Context-Aware Conversational AI**: A floating chat widget powered by **Groq LLM (Llama-3.3 70B)**.
* **Personalized AI Response**: Ingests patient gender, diagnosed skin type, primary concern, 4 recommended products, and 7-day plan to answer questions (e.g., *"Why was CeraVe recommended?", "How to handle skin purging?"*).

### 4. Interactive 7-Day Skin Cycling Scheduler
* **Routine Planner**: Interactive AM/PM checklist using "Skin Cycling" principles (Exfoliation night, Active Treatment night, Recovery nights).
* **Progress Tracking**: Tracks completed steps with local storage caching.
* **Progress comparison**: Compares diagnostic scan confidence history to calculate a Skin Betterment / Recovery index over time.

### 5. Clinical Reports & History
* **Exportable PDF Report**: Download a crisp, 2-page PDF document including patient metadata, biometric scores, recommended products table, and the full 7-day cycle.
* **MongoDB User & Scan History**: Secure authentication (JWT) with MongoDB Atlas to save previous scans and view progress history.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), JavaScript, Vanilla CSS, Lucide Icons, jsPDF, html2canvas.
* **Backend**: FastAPI (Python), Uvicorn, PyTorch, PIL, MongoDB (Motor Driver).
* **Database**: MongoDB Atlas.
* **LLM Orchestration**: Groq API (Llama-3.3-70b-versatile).

---

## 📂 Project Structure

```
AI-Skin-Intelligence-Personalized-Skincare-Planner/
├── backend/
│   ├── config/              # MongoDB database connections
│   ├── controllers/         # Request handling logic
│   ├── models/              # Pydantic & database schemas
│   ├── routes/              # FastAPI endpoint routers
│   ├── services/            # Deep learning, recommendations, & LLM services
│   ├── weights/             # PyTorch model state dicts (.pth)
│   ├── main.py              # Application entrypoint
│   └── requirements.txt     # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Scanner, Chatbot, PDF, Routine)
│   │   ├── App.jsx          # Main App controller
│   │   └── index.css        # Global CSS stylesheet & design tokens
│   ├── package.json         # NPM configuration & packages
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Python 3.8+
* Node.js 16+
* MongoDB Atlas cluster URL (or local MongoDB connection)
* Groq API Key

---

### Backend Setup

1. **Navigate to backend and create a virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGODB_URL="your-mongodb-connection-string"
   DB_NAME="your-db-name"
   GROQ_API_KEY="your-groq-api-key"
   JWT_SECRET="your-jwt-secret-key"
   ```

4. **Run the backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will run on `http://localhost:8000`.

---

### Frontend Setup

1. **Navigate to frontend and install packages**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Run the Vite development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📝 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
