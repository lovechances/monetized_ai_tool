from fastapi import HTTPException, status

from app.models.user import User


def require_pro_user(user: User) -> None:
    if user.plan != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires a pro plan."
        )


def is_pro_user(user: User) -> bool:
    return user.plan == "pro"