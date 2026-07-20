"""
Notification service: scheduled task runners that send routine reminders
and product-replenishment alerts. Designed to be invoked by a task
scheduler (e.g. Celery beat, APScheduler, or a cron-triggered endpoint).
"""
import logging
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import List

from sqlalchemy.orm import Session

from app.models.progress_log import ProgressLog
from app.models.routine import Routine
from app.models.user import User

logger = logging.getLogger(__name__)


@dataclass
class NotificationPayload:
    user_id: str
    channel: str  # push, email, sms
    title: str
    body: str


def _send(payload: NotificationPayload) -> None:
    """
    Dispatch a notification through the configured provider (e.g. FCM, SES, Twilio).
    Stubbed here to keep the service provider-agnostic; wire up a real
    provider client in production.
    """
    logger.info("Dispatching notification to user=%s via %s: %s", payload.user_id, payload.channel, payload.title)


def send_routine_reminders(db: Session, target_frequency: str) -> int:
    """
    Finds users with an active routine of `target_frequency` who have not
    logged completion today, and sends them a reminder. Returns count sent.
    """
    today = date.today()
    sent = 0

    routines = db.query(Routine).filter(Routine.frequency == target_frequency, Routine.is_active == True).all()  # noqa: E712
    for routine in routines:
        completed_field = "morning_routine_completed" if target_frequency == "morning" else "evening_routine_completed"
        todays_log = (
            db.query(ProgressLog)
            .filter(ProgressLog.user_id == routine.user_id, ProgressLog.log_date == today)
            .first()
        )
        already_done = bool(todays_log and getattr(todays_log, completed_field, False))
        if already_done:
            continue

        payload = NotificationPayload(
            user_id=routine.user_id,
            channel="push",
            title=f"Time for your {target_frequency} routine",
            body="Don't forget to complete today's skincare steps to keep your streak going.",
        )
        _send(payload)
        sent += 1

    return sent


def send_replenishment_alerts(db: Session, users_with_low_stock: List[str]) -> int:
    """
    Sends a replenishment reminder to users whose tracked product supply is
    running low. `users_with_low_stock` is expected to be produced by an
    inventory/usage-tracking job upstream of this function.
    """
    sent = 0
    for user_id in users_with_low_stock:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            continue
        payload = NotificationPayload(
            user_id=user_id,
            channel="email",
            title="Running low on a skincare product",
            body="One of your routine products looks like it's about to run out. Time to restock?",
        )
        _send(payload)
        sent += 1
    return sent


def run_daily_notification_cycle(db: Session) -> dict:
    """Convenience entrypoint for a scheduler to trigger the full daily cycle."""
    now = datetime.now(timezone.utc)
    morning_sent = send_routine_reminders(db, "morning") if now.hour in range(6, 10) else 0
    evening_sent = send_routine_reminders(db, "evening") if now.hour in range(19, 23) else 0
    return {"morning_reminders_sent": morning_sent, "evening_reminders_sent": evening_sent}
