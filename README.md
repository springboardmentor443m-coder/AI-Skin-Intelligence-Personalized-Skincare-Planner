# AI Skin Intelligence & Personalized Skincare Planner

An AI-powered skincare intelligence platform that analyzes a user's skin profile, concerns, lifestyle, and optional skin images to provide personalized skincare guidance. The application combines AI-assisted skin assessment, routine generation, ingredient compatibility analysis, product recommendations, progress tracking, clinical-style reports, and role-based dashboards in a single web platform.

> **Note:** This project is intended for educational and informational purposes. AI-generated results are not a medical diagnosis and should not replace advice from a qualified dermatologist or healthcare professional.

---

## 📌 Project Overview

**AI Skin Intelligence & Personalized Skincare Planner** is designed to make skincare planning more personalized and data-driven.

The platform collects information such as:

- Skin type
- Age group
- Skin concerns
- Allergies and sensitivities
- Sleep and hydration habits
- UV and pollution exposure
- Stress level
- Climate
- Optional skin assessment images

The application then uses AI-assisted analysis to generate skin-health insights and personalized skincare recommendations.

### Main Objectives

1. Perform AI-assisted skin assessment.
2. Identify common skin concerns and estimate their severity.
3. Generate personalized morning, evening, and weekly routines.
4. Analyze skincare ingredients and detect potential ingredient clashes.
5. Recommend skincare products based on the user's profile.
6. Track skincare progress and lifestyle factors.
7. Provide clinical-style reports and exportable data.
8. Support different user roles through role-based dashboards.
9. Provide AI-assisted consultation functionality.
10. Create a scalable foundation for future dermatologist and healthcare integrations.

---

## ✨ Key Features

### 1. AI Skin Assessment

Users can provide their skin profile and optionally upload a skin image for AI-assisted analysis.

The assessment can generate:

- Detected skin type
- Overall skin-health score
- Hydration score
- Skin-barrier health score
- Lifestyle impact score
- Primary skin concerns
- Concern severity
- Concern score
- Affected areas
- Potential risk factors
- Personalized recommendations
- AI-generated summary

The current AI service uses **Google Gemini** for analysis.

---

### 2. Personalized Skincare Routine

The application generates personalized:

- Morning routine
- Evening routine
- Weekly treatments
- Active ingredient guidance
- Product/application instructions
- Seasonal skincare advice

The routine-generation logic considers the user's profile, assessment results, allergies, and ingredient compatibility.

Users can also mark routine steps as completed to support consistency tracking.

---

### 3. Ingredient Intelligence

The Ingredient Intelligence module provides an ingredient knowledge base and an AI-powered formula checker.

Users can:

- Search ingredients
- View ingredient categories
- Review ingredient benefits
- Enter a custom ingredient list
- Analyze ingredient compatibility
- Detect possible active-ingredient clashes
- Review allergy alerts
- Receive safer layering suggestions
- Get an overall safety/compatibility score

Example input:

```text
Retinol, Vitamin C, Salicylic Acid, Niacinamide
```

The AI analyzes the formula in the context of the user's skin type, allergies, and sensitivities.

---

### 4. Product Recommendations

The platform includes a skincare product recommendation module based on the user's profile and skincare requirements.

Product categories include:

- Face Wash
- Moisturizer
- Sunscreen
- Serum
- Toner
- Treatment Products
- Face Masks
- Night Care

The current project uses a local/mock product database that can later be connected to a real product catalogue or recommendation API.

---

### 5. Progress Tracking & Analytics

Users can monitor their skincare journey through progress logs and analytics.

The module supports tracking of:

- Skin-health progress
- Routine consistency
- Lifestyle changes
- Water intake
- Sleep duration
- Assessment history
- Before/after progress data

This can be extended with charts and long-term trend analysis.

---

### 6. Reports & Exports

The application provides clinical-style skincare reports containing information such as:

- Report title
- Date
- User
- Health score
- Skin concerns
- AI summary
- Care plan
- Assessment details

The backend includes an export endpoint for CSV reports and structured report data.

---

### 7. Role-Based Dashboards

The platform supports four major roles:

| Role | Main Purpose |
|---|---|
| **User** | Personal skin assessment, routines, products, progress and reports |
| **Consultant** | Review user information and assist with skincare planning |
| **Dermatologist** | Review assessments and provide AI-assisted consultation |
| **Admin** | Manage users, roles, platform monitoring and audit information |

The application uses role-based navigation so different users can access different platform modules.

---

### 8. AI Dermatologist Consultation

Users can submit skincare-related questions through the consultation workflow.

The backend sends the following information to the AI service:

- User question
- User profile
- Skin assessment

The AI then generates contextual skincare guidance.

---

### 9. Admin & RBAC Management

The Admin Dashboard provides functionality for:

- Viewing platform users
- Searching users
- Filtering users by role
- Updating user roles
- Monitoring platform metrics
- Exporting audit/usage information
- Reviewing security-related status information

---

## 🏗️ System Architecture

```text
                         ┌───────────────────────────┐
                         │        React Frontend      │
                         │                           │
                         │  Dashboards               │
                         │  Skin Assessment          │
                         │  Routine Planner          │
                         │  Ingredient Intelligence  │
                         │  Product Recommendations  │
                         │  Progress Tracking        │
                         │  Reports & Exports        │
                         └─────────────┬─────────────┘
                                       │
                                       │ HTTP / JSON
                                       ▼
                         ┌───────────────────────────┐
                         │     Express + Vite Server  │
                         │                           │
                         │ /api/skin-assessment      │
                         │ /api/generate-routine     │
                         │ /api/ingredient-check     │
                         │ /api/consultation         │
                         │ /api/reports/export       │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       Google Gemini AI     │
                         │                           │
                         │ Skin Analysis             │
                         │ Routine Generation        │
                         │ Ingredient Analysis       │
                         │ AI Consultation           │
                         └───────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React 19
- JavaScript / JSX
- Vite
- Tailwind CSS
- Lucide React
- Motion

### Backend

- Node.js
- Express.js
- TypeScript
- TSX
- Vite middleware

### AI

- Google Gemini API
- `@google/genai`
- Gemini model configured in the project: `gemini-3.6-flash`

### Build & Development Tools

- npm
- TypeScript
- ESBuild
- Git
- GitHub

---

## 📁 Project Structure

```text
ai-skin-intelligence-&-personalized-skincare-planner/
│
├── assets/
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── ConsultantDashboard.jsx
│   │   ├── DermatologistDashboard.jsx
│   │   ├── IngredientIntelligence.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProductRecommendations.jsx
│   │   ├── ProgressTracking.jsx
│   │   ├── ProjectDocsAndPresentation.jsx
│   │   ├── ReportsAndExports.jsx
│   │   ├── RoutinePlanner.jsx
│   │   ├── SkinAssessmentView.jsx
│   │   └── UserDashboard.jsx
│   │
│   ├── data/
│   │   └── mockData.js
│   │
│   ├── server/
│   │   └── geminiService.ts
│   │
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── types.js
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔌 API Endpoints

The Express server currently exposes the following endpoints.

### Health Check

```http
GET /api/health
```

Returns the server health status.

### AI Skin Assessment

```http
POST /api/skin-assessment
```

Used to analyze a user's skin profile and optional image.

Example request:

```json
{
  "imageDataUri": "data:image/jpeg;base64,...",
  "questionnaire": {
    "skinType": "Combination",
    "ageGroup": "18-24",
    "concerns": ["Acne", "Hyperpigmentation"],
    "allergies": [],
    "lifestyle": {
      "sleepHours": 7,
      "waterIntakeLiters": 2
    }
  }
}
```

### Personalized Routine

```http
POST /api/generate-routine
```

Generates morning, evening, and weekly skincare routines.

### Ingredient Analysis

```http
POST /api/ingredient-check
```

Analyzes ingredient compatibility, allergy risks, and potential clashes.

### AI Consultation

```http
POST /api/consultation
```

Generates an AI-assisted response based on the user's question, profile, and assessment.

### Report Export

```http
POST /api/reports/export
```

Supports report data export, including CSV output.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 18+ recommended
- npm
- Git
- Google Gemini API key

Check your installations:

```bash
node --version
npm --version
```

---

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ai-skin-intelligence-and-personalized-skincare-planner
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

**Important:** Never commit your real API key to GitHub.

The project already includes `.env.example` as a reference.

---

### 4. Start the Development Server

```bash
npm run dev
```

The application runs on:

```text
http://localhost:3000
```

---

## 📦 Available npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the React frontend and bundles the server |
| `npm run start` | Starts the production server |
| `npm run preview` | Previews the Vite production build |
| `npm run lint` | Runs TypeScript checking |

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes for live AI | Google Gemini API key |
| `APP_URL` | Optional | Application base URL |

If the Gemini API is unavailable during skin assessment, the current implementation contains a fallback response for the assessment workflow.

---

## 🔄 Application Workflow

```text
User
 │
 ▼
Login / Role Selection
 │
 ▼
Create / Review Skin Profile
 │
 ▼
Skin Assessment
 │
 ├── Skin Type
 ├── Skin Concerns
 ├── Lifestyle
 ├── Allergies
 └── Optional Skin Image
 │
 ▼
Gemini AI Analysis
 │
 ▼
Personalized Skin Insights
 │
 ├── Health Score
 ├── Hydration Score
 ├── Barrier Score
 └── Concern Severity
 │
 ▼
Personalized Routine
 │
 ├── Morning
 ├── Evening
 └── Weekly
 │
 ▼
Ingredient & Product Intelligence
 │
 ▼
Progress Tracking
 │
 ▼
Reports & Exports
```

---

## 🎯 Future Enhancements

The current application provides a strong frontend and AI-integration foundation. Possible future improvements include:

- PostgreSQL or MongoDB integration
- Secure user authentication
- JWT-based authorization
- Production-grade RBAC
- Real dermatologist accounts
- Secure image storage
- Real skincare product database integration
- Product price and availability APIs
- Advanced recommendation algorithms
- Machine-learning-based skin classification
- Before/after image comparison
- Long-term skin-health prediction
- PDF report generation
- Excel report generation
- Cloud deployment
- Docker containerization
- AWS/Azure deployment
- Automated testing
- Audit logging and monitoring
- Improved privacy and healthcare-data security
- Multilingual support

---

## ⚠️ Current Project Limitations

This version is primarily a prototype / academic project.

Some data is currently stored in local/mock data rather than a production database. Authentication and role switching are also implemented at the application level and should be replaced with secure server-side authorization before production use.

AI-generated skincare recommendations should be treated as informational. The platform does not replace professional dermatological diagnosis or treatment.

---

## 🧪 Testing Checklist

Before deployment, verify:

- [ ] Application starts successfully
- [ ] Login screen works
- [ ] User dashboard loads
- [ ] Skin assessment works
- [ ] Gemini API key is configured
- [ ] Routine generation works
- [ ] Ingredient analysis works
- [ ] Product recommendations load
- [ ] Progress tracking works
- [ ] Reports load and export
- [ ] Consultant dashboard works
- [ ] Dermatologist dashboard works
- [ ] Admin dashboard works
- [ ] Role-based navigation works
- [ ] Production build completes successfully

---

## 📚 Project Modules

| Module | Description |
|---|---|
| Skin Assessment | AI-assisted skin analysis |
| User Dashboard | Personalized overview |
| Routine Planner | Personalized skincare routines |
| Ingredient Intelligence | Ingredient safety and clash detection |
| Product Recommendations | Profile-based product suggestions |
| Progress Tracking | Skin and lifestyle progress |
| Reports & Exports | Clinical-style reports and CSV export |
| Consultant Dashboard | Consultant workspace |
| Dermatologist Dashboard | Dermatologist workspace |
| Admin Dashboard | User and role management |
| Project Documentation | Project documentation and presentation |

---

## 🌱 Project Vision

The long-term vision is to develop an intelligent skincare platform that combines AI, personalized recommendations, lifestyle analysis, and professional dermatological workflows.

The system can evolve from a prototype into a full-stack skincare management platform by integrating a secure database, real authentication, validated clinical workflows, real product data, advanced machine-learning models, and cloud infrastructure.

---

## 👩‍💻 Project Information

**Project:** AI Skin Intelligence & Personalized Skincare Planner

**Project Type:** AI / Full-Stack Web Application

**Primary Technologies:** React, JavaScript, Tailwind CSS, Node.js, Express.js, TypeScript, Google Gemini API

**Primary Use Case:** Personalized skincare analysis and routine planning

**Year:** 2026

---

## 📄 License

This project is developed for educational and project demonstration purposes. Add an appropriate open-source license (such as MIT) if you intend to distribute the source code publicly.

---

## 🙌 Acknowledgements

- Google Gemini / Google AI for generative AI capabilities
- React community
- Vite community
- Tailwind CSS
- Lucide React
- Open-source JavaScript ecosystem
