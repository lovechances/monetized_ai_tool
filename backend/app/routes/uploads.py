from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile as FastAPIUploadFile

from app.db.database import get_db
from app.models.upload import Upload
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.file_service import (
    create_stored_filename,
    save_upload_file,
    validate_file_extension,
    validate_mime_type,
)


router = APIRouter(prefix="/uploads", tags=["uploads"])


class UploadResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    stored_filename: str
    file_type: str
    mime_type: str
    file_size: int
    storage_path: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=UploadResponse)
def upload_file(
    file: FastAPIUploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_extension = validate_file_extension(file.filename)
    mime_type = validate_mime_type(file.content_type)
    stored_filename = create_stored_filename(file.filename)

    storage_path, file_size = save_upload_file(file, stored_filename)

    upload = Upload(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_type=file_extension,
        mime_type=mime_type,
        file_size=file_size,
        storage_path=storage_path,
    )

    db.add(upload)
    db.commit()
    db.refresh(upload)

    return upload


@router.get("/", response_model=list[UploadResponse])
def list_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == current_user.id)
        .order_by(Upload.created_at.desc())
        .all()
    )

    return uploads


@router.get("/{upload_id}", response_model=UploadResponse)
def get_upload(
    upload_id: int,
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
        raise HTTPException(status_code=404, detail="Upload not found.")

    return upload