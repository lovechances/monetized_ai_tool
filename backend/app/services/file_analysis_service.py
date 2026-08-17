import csv
import json
from pathlib import Path

from fastapi import HTTPException

from app.models.upload import Upload
from app.services.ai_service import summarize_text


MAX_ANALYSIS_CHARACTERS = 20_000


def read_text_file(storage_path: str) -> str:
    path = Path(storage_path)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Uploaded file could not be found on disk.",
        )

    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File could not be decoded as UTF-8 text.",
        )


def read_csv_file(storage_path: str) -> str:
    path = Path(storage_path)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Uploaded file could not be found on disk.",
        )

    try:
        with path.open("r", encoding="utf-8", newline="") as csv_file:
            reader = csv.reader(csv_file)

            rows: list[str] = []

            for index, row in enumerate(reader):
                rows.append(" | ".join(row))

                if index >= 199:
                    break

            return "\n".join(rows)

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="CSV file could not be decoded as UTF-8 text.",
        )


def read_json_file(storage_path: str) -> str:
    path = Path(storage_path)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Uploaded file could not be found on disk.",
        )

    try:
        with path.open("r", encoding="utf-8") as json_file:
            data = json.load(json_file)

        return json.dumps(data, indent=2)

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="JSON file could not be decoded as UTF-8 text.",
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Uploaded JSON file is invalid.",
        )


def extract_upload_text(upload: Upload) -> str:
    file_type = upload.file_type.lower()

    if file_type in {".txt", ".md"}:
        extracted_text = read_text_file(upload.storage_path)

    elif file_type == ".csv":
        extracted_text = read_csv_file(upload.storage_path)

    elif file_type == ".json":
        extracted_text = read_json_file(upload.storage_path)

    else:
        raise HTTPException(
            status_code=400,
            detail=f"File analysis is not supported for {file_type}.",
        )

    cleaned_text = extracted_text.strip()

    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file contains no readable content.",
        )

    return cleaned_text[:MAX_ANALYSIS_CHARACTERS]


def analyze_upload_content(upload: Upload) -> tuple[str, str]:
    extracted_text = extract_upload_text(upload)

    analysis_prompt = (
        f"Analyze the uploaded file named '{upload.original_filename}'.\n\n"
        "Provide a concise summary of the most important information, "
        "main themes, notable details, and useful conclusions.\n\n"
        f"FILE CONTENT:\n{extracted_text}"
    )

    analysis_result = summarize_text(analysis_prompt)

    return extracted_text, analysis_result