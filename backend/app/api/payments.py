"""
Paystack integration stub. Implement webhook and checkout in production.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


class SubscriptionStatusOut(BaseModel):
    plan: str  # free | monthly | season_pass
    active: bool
    expires_at: str | None


@router.get("/subscription", response_model=SubscriptionStatusOut)
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    # TODO: read from UserSubscription table
    return SubscriptionStatusOut(
        plan="free",
        active=True,
        expires_at=None,
    )


@router.post("/paystack/webhook")
async def paystack_webhook():
    # TODO: verify signature, update UserSubscription, grant access
    return {"received": True}


@router.get("/checkout/monthly")
async def checkout_monthly(current_user: User = Depends(get_current_user)):
    # TODO: create Paystack transaction, return authorization_url
    raise HTTPException(
        status_code=501,
        detail="Paystack checkout not configured. Set PAYSTACK_SECRET_KEY and implement checkout.",
    )
