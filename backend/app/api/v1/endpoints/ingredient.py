from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.schemas.ingredient import IngredientAnalysisRequest, IngredientAnalysisResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.ingredient_intelligence import analyze_ingredients_list

router = APIRouter()

@router.post("/analyze", response_model=IngredientAnalysisResponse)
def analyze_skincare_ingredients(
    request: IngredientAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Run ingredient analyzer matching against active user profile
        analysis = analyze_ingredients_list(request.ingredients_text, current_user.profile)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingredient analysis failed: {e}"
        )
