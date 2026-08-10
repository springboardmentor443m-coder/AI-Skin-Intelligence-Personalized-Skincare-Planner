from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.assessment import SkinAssessment
from app.schemas.assessment import SkinAssessmentResponse, AssessmentCalculate
from app.api.v1.endpoints.auth import get_current_user
from app.services.assessment_engine import calculate_skin_health

router = APIRouter()

@router.post("/calculate", response_model=SkinAssessmentResponse)
def calculate_and_save_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Run skin assessment engine
        results = calculate_skin_health(current_user)
        
        # Save to DB
        assessment = SkinAssessment(
            user_id=current_user.id,
            health_score=results["health_score"],
            acne_level=results["levels"]["acne"],
            dryness_level=results["levels"]["dryness"],
            oiliness_level=results["levels"]["oiliness"],
            pigmentation_level=results["levels"]["pigmentation"],
            sensitivity_level=results["levels"]["sensitivity"],
            wrinkle_level=results["levels"]["wrinkles"],
            risk_factors=results["risk_factors"],
            recommendations=results["recommendations"]
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        return assessment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate skin health assessment: {e}"
        )


@router.get("/latest", response_model=SkinAssessmentResponse)
def get_latest_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch most recent assessment
    assessment = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.created_at.desc())\
        .first()
        
    if not assessment:
        # If no assessment exists yet, calculate a baseline, save it and return
        results = calculate_skin_health(current_user)
        assessment = SkinAssessment(
            user_id=current_user.id,
            health_score=results["health_score"],
            acne_level=results["levels"]["acne"],
            dryness_level=results["levels"]["dryness"],
            oiliness_level=results["levels"]["oiliness"],
            pigmentation_level=results["levels"]["pigmentation"],
            sensitivity_level=results["levels"]["sensitivity"],
            wrinkle_level=results["levels"]["wrinkles"],
            risk_factors=results["risk_factors"],
            recommendations=results["recommendations"]
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
    return assessment


@router.get("/history", response_model=List[SkinAssessmentResponse])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.created_at.asc())\
        .all()
    return assessments
