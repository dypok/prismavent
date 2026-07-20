from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta

def log_failed_attempt(db: Session, email: str, ip_address: str, user_agent: str | None = None):
    db.execute(
        text("""
            INSERT INTO failed_login_attempts (email, ip_address, user_agent)
            VALUES (:email, :ip, :ua)
        """),
        {"email": email, "ip": ip_address, "ua": user_agent}
    )
    db.commit()

def get_recent_failures(db: Session, ip_address: str, minutes: int = 5) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    result = db.execute(
        text("""
            SELECT COUNT(*) FROM failed_login_attempts
            WHERE ip_address = :ip AND attempted_at >= :cutoff
        """),
        {"ip": ip_address, "cutoff": cutoff}
    ).scalar()
    return result or 0
