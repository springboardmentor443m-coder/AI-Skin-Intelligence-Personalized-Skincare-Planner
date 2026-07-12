# AI Skin Intelligence & Personalized Skincare Planner

An enterprise-ready, modular, and containerized web application designed to analyze facial skin anomalies, predict skin categories, assess key metrics (acne, wrinkles, pigmentation, hydration), recommend personalized morning/night/weekly skincare routines, and track progress using charts and reports.

---

## Technical Stack

* **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React
* **Backend**: FastAPI (Python 3.10), SQLAlchemy (ORM), JWT Authentication, Pydantic (data validation)
* **Databases**:
  * **PostgreSQL**: Stores users, profiles, user schedules, and relational records.
  * **MongoDB**: Stores AI diagnostic logs, diagnostic history, and reports.
* **AI/ML**: TensorFlow, Keras, EfficientNetB0, MobileNetV2, OpenCV
* **DevOps**: Docker, Docker Compose, GitHub Actions, AWS

---

## System Architecture (Phase 1)

Phase 1 establishes the enterprise-grade foundation:
* **MVC Pattern**: High separation of concern using Model-Repository-Service-Controller on the Backend.
* **Security & Auth**: Bcrypt hashing for password security, JWT bearer tokens, and custom FastAPI dependencies for Role-Based Access Control (RBAC).
* **Responsive Styling**: Tailwind CSS configuration integrated with Outfit/Inter typography, animated neon backgrounds, and glassmorphism panel styles.
* **Orchestration**: Orchestrated multi-container ecosystem using Docker Compose.

---

## Directory Structure

```text
skincare-planner/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # FastAPI shared dependencies (DB sessions, current user, RBAC role-checking)
│   │   │   └── v1/
│   │   │       └── auth.py      # Registration, Login, Profile endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Settings configuration parsing .env
│   │   │   ├── database.py      # Postgres (SQLAlchemy) and MongoDB initializations
│   │   │   └── security.py      # Passlib password hashing, JWT encoding/decoding utilities
│   │   ├── models/
│   │   │   └── user.py          # SQLAlchemy User model
│   │   ├── repositories/
│   │   │   └── user_repo.py     # Repository pattern separating queries from service layer
│   │   ├── schemas/
│   │   │   ├── token.py         # Token schema definitions
│   │   │   └── user.py          # User request and response validation definitions
│   │   ├── services/
│   │   │   └── auth_service.py  # User authentication and registration business logic
│   │   └── main.py              # Entrypoint initializing CORS, schemas, and router mappings
│   ├── tests/
│   │   ├── conftest.py          # Pytest fixtures and sqlite overrides
│   │   └── test_auth.py         # Endpoint and logic integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── auth.jsx         # React Authentication Context (login, register, session verification)
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login panel utilizing Lucide icons & glassmorphism
│   │   │   ├── Register.jsx     # SignUp component supporting customizable role choices
│   │   │   └── Dashboard.jsx    # Premium dashboard layout featuring custom sidebar & mock stats
│   │   ├── services/
│   │   │   └── api.js           # Axios config injecting localStorage JWT header
│   │   ├── App.jsx              # Routing rules with Protected & Public components
│   │   ├── index.css            # Tailwind stylesheets, animated backgrounds, and scrollbar layouts
│   │   └── main.jsx             # React DOM loader
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

---

## Deployment & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose support)

### 2. Environmental Setup
Check the root `.env` file to verify configuration parameters:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=skincare_secure_pwd_123
POSTGRES_DB=skincare_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
MONGO_URI=mongodb://mongo:27017/skincare_logs
JWT_SECRET=super_secret_jwt_key_987654321_abcd
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
PROJECT_NAME="AI Skin Intelligence & Personalized Skincare Planner"
```

### 3. Running the Stack
Launch all services using Docker Compose:
```bash
docker compose up --build
```
This command builds the frontend and backend images and spins up:
* **PostgreSQL (db)**: Exposed on port `5432`.
* **MongoDB (mongo)**: Exposed on port `27017`.
* **FastAPI Backend (backend)**: Exposed on port `8000`. Documentation available at `http://localhost:8000/docs`.
* **Vite React Frontend (frontend)**: Exposed on port `5173`. Access the client at `http://localhost:5173`.

---

## Testing Verification

Unit tests are written with `pytest` and mock configurations. Run tests directly inside the backend docker container:
```bash
docker compose exec backend pytest
```
Or run locally inside the `backend/` folder (if virtualenv is configured):
```bash
cd backend
pip install -r requirements.txt
pytest
```

---

## SDLC Phase Roadmap

* **[COMPLETED] Phase 1**: Core authentication system, database setups (Postgres, Mongo), Docker configuration, and Vite + React layout.
* **Phase 2 (Next)**: Deep learning model training setup (`train.py`, `preprocess.py`, `dataset.py`), model export (`model.keras`), integration of prediction pipelines, and image upload diagnostics UI widget.
* **Phase 3**: Personalized skincare routine generator algorithms, ingredient index database, allergen scanners.
* **Phase 4**: Progress tracker (before/after image comparisons, daily charts, health logs), PDF/Excel reports exporter.
* **Phase 5**: Refinements, production build caching, unit and integration tests completion, GitHub Actions CI/CD pipelines.
