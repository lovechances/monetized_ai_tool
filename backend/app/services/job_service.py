from datetime import datetime

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.job import Job
from app.models.report import Report
from app.models.upload import Upload
from app.models.user import User
from app.services.file_analysis_service import analyze_upload_content
from app.services.usage_service import check_usage_limit, increment_usage


def process_file_analysis_job(job_id: int) -> None:
    db: Session = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()

        if job is None:
            return

        job.status = "processing"
        job.started_at = datetime.utcnow()

        db.commit()
        db.refresh(job)

        user = db.query(User).filter(User.id == job.user_id).first()

        upload = (
            db.query(Upload)
            .filter(Upload.id == job.upload_id)
            .filter(Upload.user_id == job.user_id)
            .first()
        )

        if user is None:
            raise ValueError("Job user could not be found.")

        if upload is None:
            raise ValueError("Job upload could not be found.")

        check_usage_limit(
            user,
            "file_analysis",
            db,
        )

        extracted_text, analysis_result = analyze_upload_content(upload)

        input_preview = extracted_text[:500]

        report = Report(
            user_id=user.id,
            tool_type="file_analysis",
            input_summary=(
                f"File: {upload.original_filename}\n\n"
                f"Content preview:\n{input_preview}"
            ),
            output_text=analysis_result,
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        increment_usage(
            user,
            "file_analysis",
            db,
        )

        job.report_id = report.id
        job.status = "completed"
        job.completed_at = datetime.utcnow()

        db.commit()

    except Exception as exc:
        job = db.query(Job).filter(Job.id == job_id).first()

        if job is not None:
            job.status = "failed"
            job.error_message = str(exc)
            job.completed_at = datetime.utcnow()

            db.commit()

    finally:
        db.close()