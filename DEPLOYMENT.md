# 🚀 Comprehensive Deployment Guide — AI Skin Intelligence

This repository is configured for automated, multi-platform deployment. You can deploy using **Docker Compose**, **Render Cloud**, **Vercel + Railway**, or a custom **Linux Cloud VPS (AWS EC2 / DigitalOcean)**.

---

## 🛠️ Summary of Deployment Preparations Made

1. **Backend Database Compatibility**: Added support for `postgres://` and `postgresql://` connection strings (required by Render/Railway/Supabase). Added automatic catalog seeding on first startup.
2. **Frontend Dynamic Environment Configuration**: Updated `src/api.js` to dynamically bind `import.meta.env.VITE_API_BASE_URL` with fallback to local development server.
3. **Containerization Ready**:
   - `skincare-backend/Dockerfile` (Python 3.10 + OpenCV + TensorFlow + Uvicorn)
   - `skincare-frontend/Dockerfile` & `nginx.conf` (Multi-stage Node build + Nginx static server)
   - Root `docker-compose.yml` (PostgreSQL DB + FastAPI + React Frontend)
   - Root `render.yaml` (Render 1-click infrastructure blueprint)

---

## 🐳 Option 1: Docker Compose (Local / Single VPS Server)

Best for running the entire full-stack application on a single server, local computer, or cloud virtual machine (AWS EC2, DigitalOcean Droplet, Linode, Hetzner).

### Prerequisites
- Docker & Docker Compose installed.

### Commands

1. **Navigate to project directory**:
   ```bash
   cd "AISkin _Care"
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build -d
   ```

3. **Verify running services**:
   ```bash
   docker-compose ps
   ```

4. **Access the Application**:
   - **Frontend UI**: `http://localhost` (Port 80)
   - **Backend API**: `http://localhost:8000`
   - **API Documentation**: `http://localhost:8000/docs`

5. **Stop services**:
   ```bash
   docker-compose down
   ```

---

## ☁️ Option 2: Render (1-Click Cloud Deployment - FREE Tier Supported)

Render provides hosted PostgreSQL databases, FastAPI web services, and React static sites.

### Deploying via GitHub Repository

1. Push your project repository to GitHub:
   ```bash
   git add .
   git commit -m "Add production deployment configs"
   git push origin main
   ```

2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprints**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and provision:
   - **PostgreSQL Database** (`skincare-db`)
   - **FastAPI Web Service** (`skincare-backend`)
   - **React Static Site** (`skincare-frontend`)
6. Click **Apply**.
7. In `skincare-backend` environment settings on Render, optionally set your API keys:
   - `GROQ_API_KEY` (for RAG assistant)
   - `GEMINI_API_KEY` (for RAG assistant)

---

## ⚡ Option 3: Split Deployment (Vercel Frontend + Render/Railway Backend)

### Step 1: Deploy Backend to Render or Railway
1. **Render / Railway Web Service**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `skincare-backend`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL database URL
     - `SECRET_KEY`: Long random string
2. Note your deployed Backend URL (e.g., `https://skincare-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `skincare-frontend`.
4. Framework Preset: **Vite**.
5. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://skincare-backend.onrender.com` (Your backend URL)
6. Click **Deploy**.

---

## 🔒 Production Security Checklist

- [ ] Change `SECRET_KEY` in `.env` to a strong random string (e.g., generated with `openssl rand -hex 32`).
- [ ] Configure domain SSL/TLS certificates (Nginx Certbot or Cloudflare).
- [ ] Set `GROQ_API_KEY` or `GEMINI_API_KEY` in production environment variables for full RAG chatbot feature availability.
