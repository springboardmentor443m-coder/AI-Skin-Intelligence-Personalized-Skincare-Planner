# AI Skin Intelligence & Personalized Skincare Planner

An enterprise-ready AI-powered skincare application designed to analyze facial skin scans, identify skin types and concerns, and generate highly personalized routines and ingredient matches.

---

## Project Status: Phase 1 Completed (Initialization & Authentication)

In this phase, we established the core folder structure, set up the React+Vite frontend and FastAPI backend, designed the initial database models, configured JWT authentication, and developed role-based UI layouts.

---

## Phase 1 Folder Structure

The project is structured according to MVC/Service principles for scalability and maintainability:

```text
/backend                     # FastAPI Application
  ├── app/
  │    ├── core/
  │    │    ├── config.py    # Environment settings & JWT configuration
  │    │    ├── database.py  # SQLAlchemy engine & SQLite fallback mechanism
  │    │    └── security.py  # Password hashing & JWT generation
  │    ├── models/
  │    │    ├── __init__.py
  │    │    └── user.py      # SQLAlchemy models for User and Profile
  │    ├── schemas/
  │    │    ├── __init__.py
  │    │    └── user.py      # Pydantic schemas for data validation
  │    ├── api/
  │    │    └── v1/
  │    │         ├── endpoints/
  │    │         │    ├── auth.py   # Register, Login, Auth & Role checkers
  │    │         │    └── users.py  # Profile retrieval & update endpoints
  │    │         └── router.py      # Centralized API router
  │    └── main.py           # FastAPI initialization & CORS
  └── requirements.txt       # Python dependencies

/frontend                    # React + Vite Application
  ├── src/
  │    ├── assets/
  │    ├── components/
  │    │    ├── layout/
  │    │    │    ├── Layout.jsx   # Page container framing navbar and sidebar
  │    │    │    ├── Navbar.jsx   # Topbar carrying theme toggles & logout
  │    │    │    └── Sidebar.jsx  # Role-based navigation links drawer
  │    │    └── ui/
  │    │         ├── Button.jsx   # Reusable styled button component
  │    │         ├── Card.jsx     # Card component supporting glassmorphism
  │    │         └── Input.jsx    # Input component with label & error support
  │    ├── context/
  │    │    ├── AuthContext.jsx   # Global auth state, Axios intercepts & JWT rules
  │    │    └── ThemeContext.jsx  # Application light & dark mode controls
  │    ├── pages/
  │    │    ├── Login.jsx         # Sign in panel
  │    │    ├── Register.jsx      # Dynamic signup page with roles selectors
  │    │    ├── Dashboard.jsx     # Main panel rendering role-specific details
  │    │    ├── Profile.jsx       # Skin parameters questionnaire profile page
  │    │    └── Unauthorized.jsx  # Redirection page for unauthorized access
  │    ├── App.jsx           # Routing paths & Protected Route guards
  │    ├── main.jsx          # React app entry point
  │    └── index.css         # Tailwind v4 directives & custom CSS
  ├── package.json           # Frontend npm dependencies
  ├── index.html             # HTML entry point (Inter Google Font)
  └── vite.config.js         # Vite configuration with Tailwind CSS v4 plugin
```

---

## Tech Stack Installed

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (Development fallback) / PostgreSQL (Primary), Passlib (Bcrypt), PyJWT (jose), Pydantic v2.
- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router v6, Axios, React Hook Form, Lucide React (icons).

---

## Setup & Running Instructions

### 1. Backend Setup

1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *Note: If PostgreSQL is not active or running at the default address (`localhost:5432`), the backend will automatically initialize and connect to a local SQLite database (`skincare.db`) in the backend root directory.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `/frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

---

## Manual Verification Steps (Step-by-Step Test Guide)

To verify the setup:

1. **User Sign Up (Registration)**:
   - Navigate to `http://localhost:5173/register`.
   - Enter your name, email, and choose a password (minimum 6 characters).
   - Select the role: **User / Patient** and hit **Create Account**.
   
2. **Access Control Verification**:
   - Log in with the registered credentials.
   - You will land on the **User Dashboard** showing a preview of the upcoming AI Skin Scanner and Skincare Routines.
   - Attempt to navigate to `http://localhost:5173/admin-portal` or `http://localhost:5173/dermatologist-portal` directly via the URL. You will be redirected to the **Access Denied (Unauthorized)** page.
   
3. **Profile Parameter Management**:
   - Click on **Skin Profile** in the sidebar.
   - Set your **Age**, select your **Gender**, and choose a preliminary **Skin Type** (e.g. Dry).
   - Select various concerns (e.g. *Acne*, *Wrinkles*) and enter any allergy details (e.g. *Sensitivities to benzoyl peroxide*).
   - Click **Save Skin Profile**. Upon reload or dashboard return, notice the values are successfully loaded from the backend database.
   
4. **Practitioner & Admin Portals Check**:
   - Click **Logout** from the navbar.
   - Register a new account with the role set to **Dermatologist**.
   - Log in. Notice that the sidebar now displays the **Dermatologist Console** link, and you are redirected to the Dentist/Dermatologist clinical workspace displaying mockup patient queues and practitioner stats fetched from the backend's protected `/api/v1/users/dermatologist-dashboard` endpoint.
   - Do the same with the **Admin** role to view the System Console.
   
5. **Theme Testing**:
   - Click the theme toggle icon (Sun/Moon) in the top navigation bar.
   - The application will seamlessly transition between Light Mode and Dark Mode, saving your preference in `localStorage`.
