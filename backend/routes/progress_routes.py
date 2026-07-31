from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from bson.objectid import ObjectId
# pyrefly: ignore [missing-import]
from config.database import get_database
from services.progress_service import progress_service

router = APIRouter()

class ProgressCompareByIdRequest(BaseModel):
    past_assessment_id: str
    current_assessment_id: str

class ProgressCompareByPayloadRequest(BaseModel):
    past_analysis: Dict[str, Any]
    current_analysis: Dict[str, Any]

@router.post("/compare-ids", tags=["Progress Tracker"])
async def compare_assessments_by_id(req: ProgressCompareByIdRequest):
    """
    Compare two historical skin assessment records stored in MongoDB by their ObjectIDs
    and return a Skin Betterment & Progress Report.
    """
    db = get_database()
    
    try:
        past_record = await db["assessments"].find_one({"_id": ObjectId(req.past_assessment_id)})
        current_record = await db["assessments"].find_one({"_id": ObjectId(req.current_assessment_id)})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Assessment ID format: {str(e)}")
        
    if not past_record:
        raise HTTPException(status_code=404, detail=f"Past assessment record '{req.past_assessment_id}' not found.")
    if not current_record:
        raise HTTPException(status_code=404, detail=f"Current assessment record '{req.current_assessment_id}' not found.")

    past_analysis = past_record.get("analysis", {})
    current_analysis = current_record.get("analysis", {})
    
    report = progress_service.calculate_betterment(past_analysis, current_analysis)
    
    return {
        "past_assessment_id": req.past_assessment_id,
        "current_assessment_id": req.current_assessment_id,
        "progress_report": report
    }

@router.post("/compare-direct", tags=["Progress Tracker"])
async def compare_assessments_direct(req: ProgressCompareByPayloadRequest):
    """
    Directly compare two assessment analysis JSON objects to calculate skin betterment score.
    """
    try:
        report = progress_service.calculate_betterment(req.past_analysis, req.current_analysis)
        return {
            "progress_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating progress: {str(e)}")
