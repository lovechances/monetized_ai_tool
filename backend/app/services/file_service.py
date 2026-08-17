import os
import shutil
import uuid
from pathlib import Path
from typing import Iterable

from fastapi import HTTPException, UploadFile


UPLOAD_DIR = Path("uploads")

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS = {".txt", ".md", ".csv", ".json"}

ALLOWED_MIME_TYPES = {
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "application/octet-stream",
}


def ensure_upload_dir_exists() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_file_extension(filename: str) -> str:
    extension = get_file_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {allowed}",
        )

    return extension


def validate_mime_type(mime_type: str | None) -> str:
    if not mime_type:
        return "application/octet-stream"

    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type not allowed: {mime_type}",
        )

    return mime_type


def create_stored_filename(original_filename: str) -> str:
    extension = get_file_extension(original_filename)
    safe_id = uuid.uuid4().hex
    return f"{safe_id}{extension}"


def save_upload_file(file: UploadFile, stored_filename: str) -> tuple[str, int]:
    ensure_upload_dir_exists()

    storage_path = UPLOAD_DIR / stored_filename
    total_size = 0

    with storage_path.open("wb") as buffer:
        while True:
            chunk = file.file.read(1024 * 1024)

            if not chunk:
                break

            total_size += len(chunk)

            if total_size > MAX_FILE_SIZE_BYTES:
                buffer.close()
                storage_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=400,
                    detail="File is too large. Max size is 5 MB.",
                )

            buffer.write(chunk)

    return str(storage_path), total_size