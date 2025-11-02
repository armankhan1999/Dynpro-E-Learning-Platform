from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from typing import List
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.notification import (
    NotificationCreate, NotificationResponse, NotificationPreferences
)
from app.db.models.notification import Notification
from app.db.models.user import User

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all notifications for current user."""
    result = db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    notifications = result.scalars().all()
    return notifications


@router.get("/unread", response_model=List[NotificationResponse])
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all unread notifications for current user."""
    result = db.execute(
        select(Notification)
        .where(
            and_(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            )
        )
        .order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    return notifications


@router.get("/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get count of unread notifications."""
    result = db.execute(
        select(func.count(Notification.id))
        .where(
            and_(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            )
        )
    )
    count = result.scalar()
    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a notification as read."""
    result = db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read."""
    result = db.execute(
        select(Notification).where(
            and_(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            )
        )
    )
    notifications = result.scalars().all()
    
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
    
    db.commit()
    return {"message": f"Marked {len(notifications)} notifications as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a notification."""
    result = db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()


@router.delete("/clear-all", status_code=status.HTTP_204_NO_CONTENT)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete all notifications for current user."""
    result = db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
    )
    notifications = result.scalars().all()
    
    for notification in notifications:
        db.delete(notification)
    
    db.commit()


@router.post("/send", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Send a notification (admin only)."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send notifications"
        )
    
    notification = Notification(**notification_in.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/preferences", response_model=NotificationPreferences)
def get_notification_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get notification preferences for current user."""
    # For now, return default preferences
    # In production, this would fetch from user_preferences table
    return NotificationPreferences()


@router.put("/preferences", response_model=NotificationPreferences)
def update_notification_preferences(
    preferences: NotificationPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update notification preferences for current user."""
    # For now, just return the preferences
    # In production, this would save to user_preferences table
    return preferences


@router.get("/types")
def get_notification_types(
    current_user: User = Depends(get_current_active_user)
):
    """Get available notification types."""
    return {
        "types": [
            {"value": "course_enrollment", "label": "Course Enrollment"},
            {"value": "assignment_due", "label": "Assignment Due"},
            {"value": "grade_posted", "label": "Grade Posted"},
            {"value": "discussion_reply", "label": "Discussion Reply"},
            {"value": "certificate_issued", "label": "Certificate Issued"},
            {"value": "course_update", "label": "Course Update"},
            {"value": "announcement", "label": "Announcement"},
            {"value": "system", "label": "System Notification"}
        ]
    }


@router.post("/test", status_code=status.HTTP_201_CREATED)
def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Send a test notification to current user."""
    notification = Notification(
        user_id=current_user.id,
        title="Test Notification",
        message="This is a test notification from the E-Learning Platform",
        notification_type="system"
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return {"message": "Test notification sent", "notification_id": notification.id}
