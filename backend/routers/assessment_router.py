import os
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import SkinAssessment, User
from schemas import AssessmentResponse
from auth import get_optional_current_user
from ml_model import ml_engine

router = APIRouter(prefix="/api", tags=["Skin Assessment ML"])

# Directory where uploads are stored (static path relative to main app)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/assess", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def analyze_skin_image(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be an image (JPEG, PNG, WEBP).")

    # Save original image
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    orig_filename = f"orig_{uuid.uuid4().hex[:8]}{file_ext}"
    orig_file_path = os.path.join(UPLOADS_DIR, orig_filename)

    contents = await file.read()
    with open(orig_file_path, "wb") as f:
        f.write(contents)

    # Execute ML Analysis Pipeline
    try:
        analysis_result = ml_engine.analyze_image(orig_file_path, UPLOADS_DIR)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML image processing error: {str(e)}")

    original_url = f"/uploads/{orig_filename}"
    annotated_url = f"/uploads/{analysis_result['annotated_filename']}"

    # Record in Database
    new_assessment = SkinAssessment(
        user_id=current_user.id if current_user else None,
        original_image_url=original_url,
        annotated_image_url=annotated_url,
        estimated_age=analysis_result["estimated_age"],
        skin_type=analysis_result["skin_type"],
        overall_score=analysis_result["overall_score"],
        metrics_json=json.dumps(analysis_result["metrics"])
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    return AssessmentResponse(
        id=new_assessment.id,
        user_id=new_assessment.user_id,
        original_image_url=new_assessment.original_image_url,
        annotated_image_url=new_assessment.annotated_image_url,
        estimated_age=new_assessment.estimated_age,
        skin_type=new_assessment.skin_type,
        overall_score=new_assessment.overall_score,
        metrics=json.loads(new_assessment.metrics_json),
        created_at=new_assessment.created_at
    )

@router.get("/assessments", response_model=List[AssessmentResponse])
def get_assessment_history(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if current_user:
        assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).all()
    else:
        assessments = db.query(SkinAssessment).order_by(SkinAssessment.created_at.desc()).limit(10).all()

    res = []
    for a in assessments:
        res.append(AssessmentResponse(
            id=a.id,
            user_id=a.user_id,
            original_image_url=a.original_image_url,
            annotated_image_url=a.annotated_image_url,
            estimated_age=a.estimated_age,
            skin_type=a.skin_type,
            overall_score=a.overall_score,
            metrics=json.loads(a.metrics_json),
            created_at=a.created_at
        ))
    return res

@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_by_id(assessment_id: int, db: Session = Depends(get_db)):
    a = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return AssessmentResponse(
        id=a.id,
        user_id=a.user_id,
        original_image_url=a.original_image_url,
        annotated_image_url=a.annotated_image_url,
        estimated_age=a.estimated_age,
        skin_type=a.skin_type,
        overall_score=a.overall_score,
        metrics=json.loads(a.metrics_json),
        created_at=a.created_at
    )
