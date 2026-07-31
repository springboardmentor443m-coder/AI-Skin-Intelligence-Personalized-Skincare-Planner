from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.recommendation_service import recommendation_service

router = APIRouter()

class RecommendationRequest(BaseModel):
    skin_type: str
    skin_concern: str

@router.post("/generate", tags=["Recommendations"])
async def generate_recommendations(req: RecommendationRequest):
    """
    Generate product recommendations and a 7-day personalized skincare routine 
    based on skin type and primary skin concern.
    """
    try:
        products = recommendation_service.get_product_recommendations(req.skin_type, req.skin_concern)
        routine = recommendation_service.generate_llm_routine(req.skin_type, req.skin_concern)
        
        return {
            "status": "success",
            "product_recommendations": products,
            "weekly_routine": routine
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
