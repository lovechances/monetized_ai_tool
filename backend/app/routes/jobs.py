from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.job import Job
from app.models.upload import Upload
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.job_service import process_file_analysis_job


router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],
)


class JobResponse(BaseModel):
    id: int
    user_id: int
    upload_id: int
    report_id: int | None

    job_type: str
    status: str

    error_message: str | None

    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

    class Config:
        from_attributes = True

@router.post(
    "/analyze-upload/{upload_id}",
    response_model=JobResponse,
)
def create_file_analysis_job(
    upload_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = (
        db.query(Upload)
        .filter(Upload.id == upload_id)
        .filter(Upload.user_id == current_user.id)
        .first()
    )

    if upload is None:
        raise HTTPException(
            status_code=404,
            detail="Upload not found.",
        )

    job = Job(
        user_id=current_user.id,
        upload_id=upload.id,
        job_type="file_analysis",
        status="queued",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(
        process_file_analysis_job,
        job.id,
    )

    return job

@router.get(
    "/",
    response_model=list[JobResponse],
)
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs

@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .filter(Job.user_id == current_user.id)
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    return job