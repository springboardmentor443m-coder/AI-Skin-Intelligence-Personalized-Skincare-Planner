"""
Analytics endpoints powering the role-based dashboards:
- /me            -> individual user's own trends
- /clients       -> consultant's assigned client overview
- /patients      -> dermatologist's clinical view
- /system        -> admin system + model performance metrics
"""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db, require_admin, require_any_professional
from app.models.progress_log import ProgressLog
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.recommendation_schema import DashboardSummary

router = APIRouter()


@router.get("/me", response_model=DashboardSummary)
def my_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    since = date.today() - timedelta(days=30)
    recent_logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date >= since)
        .order_by(ProgressLog.log_date.desc())
        .limit(10)
        .all()
    )

    metrics = {
        "skin_health_score": profile.latest_skin_health_score or 0.0 if profile else 0.0,
        "entries_last_30_days": float(len(recent_logs)),
    }
    recent_activity = [
        {"date": str(log.log_date), "notes": log.notes or ""} for log in recent_logs
    ]
    return DashboardSummary(metrics=metrics, recent_activity=recent_activity)


@router.get("/clients", response_model=DashboardSummary)
def consultant_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(require_any_professional)
):
    # In a full implementation, this would filter to clients assigned to
    # `current_user` via an assignment/association table.
    total_users = db.query(func.count(User.id)).filter(User.role == "user").scalar() or 0
    avg_score = db.query(func.avg(SkinProfile.latest_skin_health_score)).scalar() or 0.0

    metrics = {
        "assigned_clients": float(total_users),
        "average_client_skin_health_score": round(float(avg_score), 2),
    }
    return DashboardSummary(metrics=metrics, recent_activity=[])


@router.get("/patients", response_model=DashboardSummary)
def dermatologist_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(require_any_professional)
):
    flagged = (
        db.query(func.count(SkinProfile.id))
        .filter(SkinProfile.diagnosed_conditions.isnot(None))
        .scalar()
        or 0
    )
    metrics = {"patients_with_diagnosed_conditions": float(flagged)}
    return DashboardSummary(metrics=metrics, recent_activity=[])


@router.get("/system", response_model=DashboardSummary)
def admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_assessments = db.query(func.count(SkinProfile.id)).filter(
        SkinProfile.latest_assessment_at.isnot(None)
    ).scalar() or 0

    metrics = {
        "total_users": float(total_users),
        "total_assessments_run": float(total_assessments),
    }
    return DashboardSummary(metrics=metrics, recent_activity=[])
