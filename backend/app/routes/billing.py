import stripe

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import (
    FRONTEND_CANCEL_URL,
    FRONTEND_SUCCESS_URL,
    STRIPE_PRO_PRICE_ID,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
)
from app.db.database import get_db
from app.models.user import User
from app.routes.auth import get_current_user


stripe.api_key = STRIPE_SECRET_KEY


router = APIRouter(
    prefix="/billing",
    tags=["billing"]
)


@router.post("/create-checkout-session")
def create_checkout_session(
    current_user: User = Depends(get_current_user)
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe secret key is not configured"
        )

    if not STRIPE_PRO_PRICE_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe pro price ID is not configured"
        )

    try:
        checkout_session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price": STRIPE_PRO_PRICE_ID,
                    "quantity": 1
                }
            ],
            success_url=FRONTEND_SUCCESS_URL,
            cancel_url=FRONTEND_CANCEL_URL,
            client_reference_id=str(current_user.id),
            metadata={
                "user_id": str(current_user.id),
                "plan": "pro"
            }
        )

        return {
            "checkout_url": checkout_session.url
        }

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error)
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    payload = await request.body()
    signature_header = request.headers.get("stripe-signature")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret is not configured"
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature_header,
            secret=STRIPE_WEBHOOK_SECRET
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload"
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        user_id = session["client_reference_id"]

        if not user_id:
            return {
                "status": "ignored",
                "reason": "No client_reference_id found on checkout session"
            }

        try:
            user_id_int = int(user_id)
        except ValueError:
            return {
                "status": "ignored",
                "reason": f"Invalid client_reference_id: {user_id}"
            }

        user = db.query(User).filter(User.id == user_id_int).first()

        if user is None:
            return {
                "status": "ignored",
                "reason": f"User not found for id {user_id_int}"
            }

        user.plan = "pro"

        db.commit()
        db.refresh(user)

        return {
            "status": "success",
            "message": "User upgraded to pro",
            "user_id": user.id,
            "plan": user.plan
        }