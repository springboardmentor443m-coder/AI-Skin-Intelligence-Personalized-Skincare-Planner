import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import MedicalReport, User
from schemas import MedicalReportListResponse, MedicalReportResponse

router = APIRouter(prefix="/medical-reports", tags=["Medical Reports"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads" / "reports"
ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}
MAX_REPORT_SIZE_BYTES = 10 * 1024 * 1024


@router.get("", response_model=MedicalReportListResponse)
def list_medical_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.upload_date.desc())
        .all()
    )
    return MedicalReportListResponse(
        total=len(reports),
        reports=[MedicalReportResponse.model_validate(report) for report in reports],
    )


@router.post("", response_model=MedicalReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported report type. Upload a PDF, JPG, JPEG, or PNG file.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded report is empty.")
    if len(file_bytes) > MAX_REPORT_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report must be 10 MB or smaller.")

    safe_suffix = Path(file.filename or "report").suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{safe_suffix}"
    user_dir = UPLOAD_ROOT / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)
    file_path = user_dir / stored_name
    file_path.write_bytes(file_bytes)

    report = MedicalReport(
        user_id=current_user.id,
        file_name=file.filename or "medical-report",
        file_type=content_type,
        file_path=str(file_path),
        file_size=len(file_bytes),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}")
def retrieve_medical_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical report not found.")
    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file is missing.")
    return FileResponse(
        report.file_path,
        media_type=report.file_type,
        filename=report.file_name,
    )


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medical_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == current_user.id)
        .first()
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical report not found.")

    if os.path.exists(report.file_path):
        os.remove(report.file_path)
    db.delete(report)
    db.commit()
    return None
