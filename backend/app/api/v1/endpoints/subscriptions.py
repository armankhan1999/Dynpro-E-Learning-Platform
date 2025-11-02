from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()


@router.post("/subscriptions/create")
def create_subscription(
    plan_id: UUID,
    payment_method_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a subscription."""
    return {
        "subscription_id": "sub_123",
        "plan_id": str(plan_id),
        "status": "active",
        "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }


@router.get("/subscriptions/plans")
def get_subscription_plans(db: Session = Depends(get_db)):
    """Get available subscription plans."""
    plans = [
        {"id": "plan-1", "name": "Monthly", "price": 29.99, "interval": "month"},
        {"id": "plan-2", "name": "Annual", "price": 299.99, "interval": "year"}
    ]
    return {"plans": plans}


@router.get("/subscriptions/current")
def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's current subscription."""
    return {
        "subscription_id": "sub_123",
        "plan_name": "Monthly",
        "status": "active",
        "current_period_end": (datetime.utcnow() + timedelta(days=15)).isoformat()
    }


@router.post("/subscriptions/{subscription_id}/cancel")
def cancel_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel a subscription."""
    return {
        "subscription_id": str(subscription_id),
        "status": "canceled",
        "canceled_at": datetime.utcnow().isoformat()
    }


@router.post("/subscriptions/{subscription_id}/resume")
def resume_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resume a canceled subscription."""
    return {
        "subscription_id": str(subscription_id),
        "status": "active",
        "resumed_at": datetime.utcnow().isoformat()
    }
