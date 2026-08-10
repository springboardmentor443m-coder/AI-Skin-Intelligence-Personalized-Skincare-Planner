from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, ai, assessment, routine, ingredient, recommendation

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
api_router.include_router(routine.router, prefix="/routine", tags=["routine"])
api_router.include_router(ingredient.router, prefix="/ingredient", tags=["ingredient"])
api_router.include_router(recommendation.router, prefix="/recommendation", tags=["recommendation"])
