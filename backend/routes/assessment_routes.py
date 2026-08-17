from typing import Optional, Dict, Any
from fastapi import APIRouter, File, UploadFile, Depends
from controllers.assessment_controller import analyze_and_save_assessment
from services.auth_service import get_current_user

router = APIRouter()

@router.post("/analyze", tags=["Assessments"])
async def analyze_skin_image(
    file: UploadFile = File(...),
    gender: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Upload an image of a face to get AI predictions for Skin Type and Skin Concerns.
    If authenticated with a Bearer Token, the scan is linked to the user's account.
    """
    user_gender = gender or (current_user.get("gender") if current_user else "Unisex")
    return await analyze_and_save_assessment(file, current_user=current_user, gender=user_gender)
