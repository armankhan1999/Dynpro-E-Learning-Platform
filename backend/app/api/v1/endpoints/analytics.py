from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.get("/analytics/user/{user_id}")
def get_user_analytics(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user learning analytics."""
    return {
        "user_id": str(user_id),
        "total_courses": 12,
        "completed_courses": 8,
        "in_progress": 4,
        "total_time_spent": 4800,  # minutes
        "average_score": 85.5,
        "certificates_earned": 8,
        "badges_earned": 15,
        "streak_days": 7
    }


@router.get("/analytics/course/{course_id}")
def get_course_analytics(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Get course analytics."""
    return {
        "course_id": str(course_id),
        "total_enrollments": 245,
        "active_students": 189,
        "completion_rate": 72.5,
        "average_rating": 4.5,
        "average_time_to_complete": 2400,  # minutes
        "most_difficult_module": "Advanced Concepts"
    }


@router.get("/analytics/platform")
def get_platform_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get platform-wide analytics."""
    return {
        "total_users": 1250,
        "active_users": 890,
        "total_courses": 85,
        "total_enrollments": 3420,
        "completion_rate": 68.5,
        "revenue": 125000,
        "growth_rate": 12.5
    }


@router.get("/analytics/engagement")
def get_engagement_metrics(
    period: str = "week",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get user engagement metrics."""
    return {
        "period": period,
        "daily_active_users": 450,
        "weekly_active_users": 890,
        "monthly_active_users": 1100,
        "average_session_duration": 45,  # minutes
        "bounce_rate": 15.5
    }


@router.get("/analytics/revenue")
def get_revenue_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get revenue analytics."""
    return {
        "total_revenue": 125000,
        "monthly_recurring_revenue": 15000,
        "average_order_value": 99,
        "conversion_rate": 5.5,
        "refund_rate": 2.1
    }
