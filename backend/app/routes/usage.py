from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.services.usage_service import get_usage_status


router = APIRouter(
    prefix="/usage",
    tags=["usage"]
)


TRACKED_TOOLS = [
    "summarize",
    "pro_summary"
]


class UsageStatusResponse(BaseModel):
    user_id: int
    plan: str
    tool_name: str
    usage_month: str
    used: int
    limit: int
    remaining: int


class AllUsageResponse(BaseModel):
    user_id: int
    email: str
    plan: str
    tools: list[UsageStatusResponse]


@router.get("/all", response_model=AllUsageResponse)
def get_all_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool_statuses = []

    for tool_name in TRACKED_TOOLS:
        status = get_usage_status(
            user=current_user,
            tool_name=tool_name,
            db=db
        )

        tool_statuses.append(status)

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "plan": current_user.plan,
        "tools": tool_statuses
    }


@router.get("/", response_model=UsageStatusResponse)
def get_my_default_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_usage_status(
        user=current_user,
        tool_name="summarize",
        db=db
    )


@router.get("/{tool_name}", response_model=UsageStatusResponse)
def get_my_tool_usage(
    tool_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_usage_status(
        user=current_user,
        tool_name=tool_name,
        db=db
    )