"""
Progress endpoints: log daily check-ins, upload progress photo metadata,
compare entries over time, and compute routine adherence rates.
"""
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.progress_log import ProgressLog
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class ProgressLogCreate(BaseModel):
    water_intake_ml: Optional[float] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None
    morning_routine_completed: Optional[bool] = False
    evening_routine_completed: Optional[bool] = False
    photo_url: Optional[str] = None
    photo_angle: Optional[str] = None
    notes: Optional[str] = None


class ProgressLogOut(ProgressLogCreate):
    id: str
    log_date: date

    class Config:
        from_attributes = True


class AdherenceSummary(BaseModel):
    period_days: int
    morning_adherence_pct: float
    evening_adherence_pct: float
    entries_logged: int


@router.post("/", response_model=ProgressLogOut, status_code=status.HTTP_201_CREATED)
def create_log(
    log_in: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    log = ProgressLog(user_id=current_user.id, **log_in.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/", response_model=List[ProgressLogOut])
def list_logs(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    since = date.today() - timedelta(days=days)
    return (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date >= since)
        .order_by(ProgressLog.log_date.desc())
        .all()
    )


@router.get("/adherence", response_model=AdherenceSummary)
def get_adherence(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    since = date.today() - timedelta(days=days)
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date >= since)
        .all()
    )
    total = len(logs)
    if total == 0:
        return AdherenceSummary(period_days=days, morning_adherence_pct=0.0, evening_adherence_pct=0.0, entries_logged=0)

    morning_pct = sum(1 for log in logs if log.morning_routine_completed) / total * 100
    evening_pct = sum(1 for log in logs if log.evening_routine_completed) / total * 100

    return AdherenceSummary(
        period_days=days,
        morning_adherence_pct=round(morning_pct, 1),
        evening_adherence_pct=round(evening_pct, 1),
        entries_logged=total,
    )


@router.get("/{log_id}", response_model=ProgressLogOut)
def get_log(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    log = db.query(ProgressLog).filter(ProgressLog.id == log_id, ProgressLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress log not found")
    return log
