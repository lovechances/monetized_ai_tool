from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    results = []

    for user in users:
        results.append({
            "id": user.id,
            "email": user.email,
            "plan": user.plan,
            "is_active": user.is_active,
            "created_at": user.created_at
        })

    return {
        "users": results
    }
