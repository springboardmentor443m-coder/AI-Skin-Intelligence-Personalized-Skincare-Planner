# Skincare Platform — Backend (Step 1)

This is the backend skeleton: FastAPI + PostgreSQL + JWT auth + Skin Profile CRUD.

## What's included so far
- User signup/login with hashed passwords and JWT tokens
- Role field on User (user / consultant / dermatologist / admin)
- Skin Profile create/update/view, protected by login
- Auto-created database tables (dev mode)

## Setup

1. **Install PostgreSQL** locally (or use a Docker container) and create a database:
   ```sql
   CREATE DATABASE skincare_db;
   ```

2. **Create a virtual environment and install dependencies:**
   ```bash
   cd skincare-backend
   python -m venv venv
   source venv/bin/activate      # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # edit .env with your real DB password and a random SECRET_KEY
   ```

4. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Open the interactive API docs:**
   Visit http://127.0.0.1:8000/docs — FastAPI auto-generates a UI where you can
   test signup, login, and skin-profile endpoints directly in the browser.

## Try it out (via /docs or curl)

**Signup:**
```bash
curl -X POST http://127.0.0.1:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"secret123"}'
```

**Login:**
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -F "username=test@example.com" -F "password=secret123"
```
Copy the `access_token` from the response.

**Create skin profile (use the token above):**
```bash
curl -X POST http://127.0.0.1:8000/skin-profile/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"skin_type":"oily","age_group":"20-25","skin_concerns":["acne","dark_spots"]}'
```

## Next steps (what we build after this)
1. AI image-processing module (skin tone / skin type / acne severity detection)
2. Connect AI output into `detected_skin_tone`, `detected_skin_type`, `detected_acne_severity`
3. Product recommendation engine
4. React frontend
