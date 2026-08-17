from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.db.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    upload_id = Column(
        Integer,
        ForeignKey("uploads.id"),
        nullable=False,
        index=True,
    )

    report_id = Column(
        Integer,
        ForeignKey("reports.id"),
        nullable=True,
    )

    job_type = Column(String, nullable=False)

    status = Column(
        String,
        nullable=False,
        default="queued",
    )

    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    started_at = Column(DateTime, nullable=True)

    completed_at = Column(DateTime, nullable=True)