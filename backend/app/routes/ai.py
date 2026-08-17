from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.report import Report
from app.models.user import User
from app.models.upload import Upload
from app.routes.auth import get_current_user
from app.services.ai_service import summarize_text
from app.services.file_analysis_service import analyze_upload_content
from app.services.usage_service import check_usage_limit, increment_usage
from app.services.plan_service import require_pro_user


router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    user_id: int
    email: str
    report_id: int
    summary: str

class ProSummaryResponse(BaseModel):
    user_id: int
    email: str
    plan: str
    pro_summary: str

class FileAnalysisResponse(BaseModel):
    upload_id: int
    report_id: int
    user_id: int
    email: str
    filename: str
    tool_type: str
    analysis: str

@router.post("/summarize", response_model=SummarizeResponse)
def summarize(
    request_data: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool_name = "summarize"

    check_usage_limit(
        user=current_user,
        tool_name=tool_name,
        db=db
    )

    summary = summarize_text(request_data.text)

    input_preview = request_data.text.strip()[:200]

    new_report = Report(
        user_id=current_user.id,
        tool_type=tool_name,
        input_summary=input_preview,
        output_text=summary
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    increment_usage(
        user=current_user,
        tool_name=tool_name,
        db=db
    )

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "report_id": new_report.id,
        "summary": summary
    }

@router.post("/pro-summary", response_model=ProSummaryResponse)
def pro_summary(
    request_data: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool_name = "pro_summary"

    require_pro_user(current_user)

    check_usage_limit(
        user=current_user,
        tool_name=tool_name,
        db=db
    )

    summary = summarize_text(request_data.text)

    increment_usage(
        user=current_user,
        tool_name=tool_name,
        db=db
    )

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "plan": current_user.plan,
        "pro_summary": f"PRO FEATURE RESULT: {summary}"
    }

@router.post(
    "/analyze-upload/{upload_id}",
    response_model=FileAnalysisResponse,
)
def analyze_uploaded_file(
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
        raise HTTPException(
            status_code=404,
            detail="Upload not found.",
        )

    check_usage_limit(
        current_user,
        "file_analysis",
        db,
    )

    extracted_text, analysis_result = analyze_upload_content(upload)

    input_preview = extracted_text[:500]

    report = Report(
        user_id=current_user.id,
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
        current_user,
        "file_analysis",
        db,
    )

    return FileAnalysisResponse(
        upload_id=upload.id,
        report_id=report.id,
        user_id=current_user.id,
        email=current_user.email,
        filename=upload.original_filename,
        tool_type="file_analysis",
        analysis=analysis_result,
    )