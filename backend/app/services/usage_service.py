from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.usage import Usage
from app.models.user import User


FREE_PLAN_LIMITS = {
    "summarize": 5,
    "pro_summary": 0,
    "file_analysis": 3,
}

PRO_PLAN_LIMITS = {
    "summarize": 100,
    "pro_summary": 100,
    "file_analysis": 50,
}

def get_current_usage_month() -> str:
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m")


def get_limit_for_user(user: User, tool_name: str) -> int:
    if user.plan == "pro":
        return PRO_PLAN_LIMITS.get(tool_name, 0)

    return FREE_PLAN_LIMITS.get(tool_name, 0)


def get_or_create_usage_record(
    user: User,
    tool_name: str,
    db: Session
) -> Usage:
    usage_month = get_current_usage_month()

    usage_record = db.query(Usage).filter(
        Usage.user_id == user.id,
        Usage.tool_name == tool_name,
        Usage.usage_month == usage_month
    ).first()

    if usage_record:
        return usage_record

    usage_record = Usage(
        user_id=user.id,
        tool_name=tool_name,
        usage_month=usage_month,
        run_count=0
    )

    db.add(usage_record)
    db.commit()
    db.refresh(usage_record)

    return usage_record


def get_usage_status(
    user: User,
    tool_name: str,
    db: Session
) -> dict:
    usage_record = get_or_create_usage_record(user, tool_name, db)

    usage_limit = get_limit_for_user(user, tool_name)

    remaining = usage_limit - usage_record.run_count

    if remaining < 0:
        remaining = 0

    return {
        "user_id": user.id,
        "plan": user.plan,
        "tool_name": tool_name,
        "usage_month": usage_record.usage_month,
        "used": usage_record.run_count,
        "limit": usage_limit,
        "remaining": remaining
    }


def check_usage_limit(
    user: User,
    tool_name: str,
    db: Session
) -> None:
    usage_status = get_usage_status(user, tool_name, db)

    if usage_status["remaining"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usage limit reached. Upgrade to continue."
        )


def increment_usage(
    user: User,
    tool_name: str,
    db: Session
) -> Usage:
    usage_record = get_or_create_usage_record(user, tool_name, db)

    usage_record.run_count += 1

    db.commit()
    db.refresh(usage_record)

    return usage_record