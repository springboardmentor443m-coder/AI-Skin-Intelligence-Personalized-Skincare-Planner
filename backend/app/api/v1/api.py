"""Main v1 API router: mounts every sub-router under its resource prefix."""
from fastapi import APIRouter

from app.api.v1 import analytics, assessment, auth, ingredients, products, profile, progress, routines

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Skin Profile"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["AI Assessment"])
api_router.include_router(routines.router, prefix="/routines", tags=["Routines"])
api_router.include_router(ingredients.router, prefix="/ingredients", tags=["Ingredients"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress Tracking"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Dashboards"])
