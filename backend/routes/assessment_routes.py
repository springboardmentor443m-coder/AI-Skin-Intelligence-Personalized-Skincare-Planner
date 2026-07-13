from fastapi import APIRouter, File, UploadFile
from controllers.assessment_controller import analyze_and_save_assessment

router = APIRouter()

@router.post("/analyze", tags=["Assessments"])
async def analyze_skin_image(file: UploadFile = File(...)):
    """
    Upload an image of a face to get AI predictions for Skin Type and Skin Concerns.
    The result is automatically saved to MongoDB.
    """
    return await analyze_and_save_assessment(file)
