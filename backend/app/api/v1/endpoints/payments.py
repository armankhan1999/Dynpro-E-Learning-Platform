from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/payments/create-intent")
def create_payment_intent(
    course_id: UUID,
    amount: float,
    currency: str = "USD",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a payment intent."""
    return {
        "payment_intent_id": "pi_123",
        "client_secret": "secret_123",
        "amount": amount,
        "currency": currency,
        "status": "requires_payment_method"
    }


@router.post("/payments/confirm")
def confirm_payment(
    payment_intent_id: str,
    payment_method_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Confirm a payment."""
    return {
        "payment_id": "pay_123",
        "status": "succeeded",
        "amount": 99.99,
        "confirmed_at": datetime.utcnow().isoformat()
    }


@router.get("/payments/history")
def get_payment_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's payment history."""
    payments = [
        {
            "id": f"pay-{i}",
            "course_title": f"Course {i}",
            "amount": 99.99,
            "status": "succeeded",
            "created_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 6)
    ]
    return {"payments": payments[skip:skip + limit], "total": len(payments)}


@router.post("/payments/refund")
def request_refund(
    payment_id: UUID,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Request a payment refund."""
    return {
        "refund_id": "ref_123",
        "payment_id": str(payment_id),
        "status": "pending",
        "requested_at": datetime.utcnow().isoformat()
    }


@router.get("/payments/{payment_id}")
def get_payment_details(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get payment details."""
    return {
        "id": str(payment_id),
        "amount": 99.99,
        "currency": "USD",
        "status": "succeeded",
        "course_id": "course-1",
        "created_at": datetime.utcnow().isoformat()
    }
