"""
Report service: compiles a user's skin profile, assessment history, and
progress logs into downloadable PDF and Excel reports (e.g. for sharing
with a dermatologist or for personal record-keeping).
"""
import os
from datetime import date
from typing import List, Optional

from app.core.config import settings


def _ensure_output_dir() -> str:
    os.makedirs(settings.REPORT_OUTPUT_DIR, exist_ok=True)
    return settings.REPORT_OUTPUT_DIR


def generate_pdf_report(
    user_id: str,
    user_name: str,
    skin_health_score: Optional[float],
    concerns: List[dict],
    progress_summary: dict,
) -> str:
    """
    Builds a clinical-style PDF summary. Uses reportlab, which produces
    vector PDF output suitable for printing or sharing with a dermatologist.
    Returns the path to the generated file.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    output_dir = _ensure_output_dir()
    filename = f"{output_dir}/skin_report_{user_id}_{date.today().isoformat()}.pdf"

    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    y = height - 72
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, y, "AI Skin Intelligence — Clinical Summary")
    y -= 28

    c.setFont("Helvetica", 11)
    c.drawString(72, y, f"Patient: {user_name}")
    y -= 16
    c.drawString(72, y, f"Report date: {date.today().isoformat()}")
    y -= 24

    c.setFont("Helvetica-Bold", 13)
    c.drawString(72, y, f"Skin Health Score: {skin_health_score if skin_health_score is not None else 'N/A'}")
    y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, "Predicted Concerns:")
    y -= 18
    c.setFont("Helvetica", 10)
    if concerns:
        for concern in concerns:
            line = f"- {concern.get('concern')}: {concern.get('severity')} (confidence {concern.get('confidence', 0):.0%})"
            c.drawString(84, y, line)
            y -= 14
    else:
        c.drawString(84, y, "No concerns flagged.")
        y -= 14

    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, "Progress Summary (last 30 days):")
    y -= 18
    c.setFont("Helvetica", 10)
    for key, value in progress_summary.items():
        c.drawString(84, y, f"{key.replace('_', ' ').title()}: {value}")
        y -= 14

    c.showPage()
    c.save()
    return filename


def generate_excel_report(
    user_id: str,
    progress_logs: List[dict],
) -> str:
    """
    Builds an Excel workbook of raw progress-log rows for data-oriented
    users or consultants who want to analyze trends themselves.
    Returns the path to the generated file.
    """
    from openpyxl import Workbook

    output_dir = _ensure_output_dir()
    filename = f"{output_dir}/progress_export_{user_id}_{date.today().isoformat()}.xlsx"

    wb = Workbook()
    ws = wb.active
    ws.title = "Progress Logs"

    headers = [
        "log_date",
        "water_intake_ml",
        "sleep_hours",
        "stress_level",
        "morning_routine_completed",
        "evening_routine_completed",
        "notes",
    ]
    ws.append(headers)

    for log in progress_logs:
        ws.append([log.get(h, "") for h in headers])

    wb.save(filename)
    return filename
