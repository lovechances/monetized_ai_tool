from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import (
    APP_ENV,
    APP_NAME,
    APP_VERSION,
    STRIPE_PRO_PRICE_ID,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
)
from app.db.database import get_db


router = APIRouter(
    prefix="/system",
    tags=["system"]
)


@router.get("/status")
def system_status(db: Session = Depends(get_db)):
    database_ok = True

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        database_ok = False

    return {
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "environment": APP_ENV,
        "database_ok": database_ok,
        "stripe_secret_configured": bool(STRIPE_SECRET_KEY),
        "stripe_price_configured": bool(STRIPE_PRO_PRICE_ID),
        "stripe_webhook_configured": bool(STRIPE_WEBHOOK_SECRET),
        "auth_enabled": True,
        "billing_enabled": bool(
            STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID and STRIPE_WEBHOOK_SECRET
        )
    }