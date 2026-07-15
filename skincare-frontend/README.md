# Skincare Platform — Frontend (Step 4, done early for visibility)

A real React app that talks to your FastAPI backend — login/signup page and a
dashboard showing your skin profile and score.

## Requirements
- Node.js installed (v18 or newer). Check with: `node -v`
  If you don't have it, download from https://nodejs.org (choose the LTS version).
- Your backend (`skincare-backend`) must be running at `http://127.0.0.1:8000`
  (run `uvicorn app.main:app --reload` in that project first).

## Setup

```bash
cd skincare-frontend
npm install
npm run dev
```

Then open the URL it prints (usually **http://localhost:5173**).

## What you'll see
1. A login/signup screen (left panel: brand visual, right panel: form).
2. Sign up with a new account, or log in with one you already created via
   the backend's `/docs` page (e.g. test@example.com / secret123).
3. A dashboard showing:
   - A skin health score ring (empty until the AI scoring module is built)
   - Your skin profile (editable)
   - "AI-detected" tags for skin tone/type/acne — these stay "pending" until
     Step 2 (the image-processing model) is connected.

## Notes
- The token from login is stored in your browser's localStorage, so refreshing
  the page keeps you logged in. "Log out" clears it.
- If you see a network error on login/signup, double check the backend is
  running and reachable at `http://127.0.0.1:8000`.
