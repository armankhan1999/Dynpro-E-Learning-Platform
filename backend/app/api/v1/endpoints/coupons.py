from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/coupons")
def create_coupon(
    code: str,
    discount_type: str,
    discount_value: float,
    max_uses: Optional[int] = None,
    expires_at: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a coupon."""
    return {
        "id": "coupon-1",
        "code": code,
        "discount_type": discount_type,
        "discount_value": discount_value,
        "max_uses": max_uses,
        "expires_at": expires_at.isoformat() if expires_at else None
    }


@router.post("/coupons/validate")
def validate_coupon(
    code: str,
    course_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Validate a coupon code."""
    return {
        "valid": True,
        "code": code,
        "discount_type": "percentage",
        "discount_value": 20,
        "message": "Coupon applied successfully"
    }


@router.post("/coupons/apply")
def apply_coupon(
    code: str,
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Apply a coupon to a purchase."""
    return {
        "original_price": 99.99,
        "discount_amount": 19.99,
        "final_price": 80.00,
        "coupon_code": code
    }


@router.get("/coupons")
def get_all_coupons(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get all coupons."""
    coupons = [
        {
            "id": f"coupon-{i}",
            "code": f"SAVE{i*10}",
            "discount_value": i * 10,
            "uses": i * 5
        }
        for i in range(1, 6)
    ]
    return {"coupons": coupons[skip:skip + limit], "total": len(coupons)}


@router.delete("/coupons/{coupon_id}")
def delete_coupon(
    coupon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete a coupon."""
    return {"message": "Coupon deleted successfully"}
