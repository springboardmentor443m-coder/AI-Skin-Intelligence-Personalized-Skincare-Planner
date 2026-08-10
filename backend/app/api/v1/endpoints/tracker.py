from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.tracker import SkinLog
from app.models.assessment import SkinAssessment
from app.schemas.tracker import SkinLogCreate, SkinLogResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/logs", response_model=List[SkinLogResponse])
def get_skin_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all historical logs of the current user sorted chronologically.
    """
    return db.query(SkinLog).filter(
        SkinLog.user_id == current_user.id
    ).order_by(SkinLog.logged_at.asc()).all()

@router.post("/logs", response_model=SkinLogResponse)
def log_daily_metrics(
    payload: SkinLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a daily skin log entry. If a log already exists for today (in UTC),
    it updates the existing log to prevent chart duplication.
    """
    now = datetime.now(timezone.utc)
    # Define start of today in UTC
    start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    
    # Check if user already logged today
    existing = db.query(SkinLog).filter(
        SkinLog.user_id == current_user.id,
        SkinLog.logged_at >= start_of_today
    ).first()
    
    # Sync health score from latest AI assessment if available
    health_score = payload.health_score
    if health_score == 95:  # default flag
        latest_assessment = db.query(SkinAssessment).filter(
            SkinAssessment.user_id == current_user.id
        ).order_by(SkinAssessment.created_at.desc()).first()
        if latest_assessment:
            health_score = latest_assessment.health_score
            
    if existing:
        # Update existing
        existing.health_score = health_score
        existing.hydration_level = payload.hydration_level
        existing.sleep_hours = payload.sleep_hours
        existing.stress_level = payload.stress_level
        existing.acne_level = payload.acne_level
        existing.dryness_level = payload.dryness_level
        existing.sensitivity_level = payload.sensitivity_level
        existing.notes = payload.notes
        if payload.photo_url:
            existing.photo_url = payload.photo_url
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new
        new_log = SkinLog(
            user_id=current_user.id,
            logged_at=now,
            health_score=health_score,
            hydration_level=payload.hydration_level,
            sleep_hours=payload.sleep_hours,
            stress_level=payload.stress_level,
            acne_level=payload.acne_level,
            dryness_level=payload.dryness_level,
            sensitivity_level=payload.sensitivity_level,
            notes=payload.notes,
            photo_url=payload.photo_url
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log

@router.get("/stats")
def get_tracker_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns summary statistics for the user profile (e.g. average hydration, sleep, stress, and compliance rate).
    """
    logs = db.query(SkinLog).filter(SkinLog.user_id == current_user.id).all()
    if not logs:
        return {
            "avg_hydration": 0,
            "avg_sleep": 0,
            "avg_stress": 0,
            "compliance_rate": 0
        }
        
    total_hydration = sum(log.hydration_level for log in logs)
    total_sleep = sum(log.sleep_hours for log in logs)
    total_stress = sum(log.stress_level for log in logs)
    
    # Calculate routine compliance (simulated as percentage of logged days over a rolling 7-day span)
    compliance_rate = min(100, int((len(logs) / 7.0) * 100))
    
    return {
        "avg_hydration": int(total_hydration / len(logs)),
        "avg_sleep": round(total_sleep / len(logs), 1),
        "avg_stress": round(total_stress / len(logs), 1),
        "compliance_rate": compliance_rate
    }
