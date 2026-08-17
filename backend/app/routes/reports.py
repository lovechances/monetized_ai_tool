from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.report import Report
from app.models.user import User
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)


class ReportResponse(BaseModel):
    id: int
    user_id: int
    tool_type: str
    input_summary: str
    output_text: str
    created_at: datetime


@router.get("/", response_model=list[ReportResponse])
def list_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).all()

    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_my_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return report

@router.get("/{report_id}/export")
def export_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id)
        .filter(Report.user_id == current_user.id)
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    content = (
        f"Report #{report.id}\n"
        f"Tool: {report.tool_type}\n"
        f"Created: {report.created_at}\n\n"
        f"INPUT\n"
        f"-----\n"
        f"{report.input_summary}\n\n"
        f"OUTPUT\n"
        f"------\n"
        f"{report.output_text}\n"
    )

    filename = f"report-{report.id}.txt"

    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )