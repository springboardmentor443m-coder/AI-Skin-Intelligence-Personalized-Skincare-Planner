from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from config.database import connect_to_mongo, close_mongo_connection
from routes import assessment_routes, recommendation_routes, progress_routes, auth_routes
import uvicorn

app = FastAPI(
    title="AI Skin Intelligence API",
    description="Backend API for Personalized Skincare Planner",
    version="1.0.0"
)

# CORS Middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routes
app.include_router(auth_routes.router, prefix="/api/auth")
app.include_router(assessment_routes.router, prefix="/api/assessments")
app.include_router(recommendation_routes.router, prefix="/api/recommendations")
app.include_router(progress_routes.router, prefix="/api/progress")

@app.get("/")
def root():
    return {"message": "Welcome to the AI Skin Intelligence API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
