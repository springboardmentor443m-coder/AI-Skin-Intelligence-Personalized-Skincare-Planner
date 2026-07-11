from statistics import mean

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.skin_profile import ProgressLog
from app.models.user import User
from app.schemas.analytics import ProgressLogCreate, ProgressLogRead, ProgressSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/log", response_model=ProgressLogRead, status_code=201)
def log_progress(
    entry: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = ProgressLog(
        user_id=current_user.id,
        routine_adherence_pct=entry.routine_adherence_pct,
        notes=entry.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/progress", response_model=ProgressSummary)
def get_progress(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id)
        .order_by(ProgressLog.logged_at.desc())
        .all()
    )

    adherence_values = [
        log.routine_adherence_pct
        for log in logs
        if log.routine_adherence_pct is not None
    ]

    return ProgressSummary(
        total_logs=len(logs),
        average_adherence_pct=round(mean(adherence_values), 1) if adherence_values else None,
        logs=logs,
    )


@router.get("/summary", response_model=ProgressSummary)
def get_summary(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Alias of /progress kept for clients that expect a dedicated
    'summary' endpoint; returns the same aggregated payload.
    """
    return get_progress(db=db, current_user=current_user)
