from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.get("/settings/platform")
def get_platform_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get platform settings."""
    return {
        "site_name": "E-Learning Platform",
        "allow_registration": True,
        "require_email_verification": True,
        "max_upload_size": 100,
        "session_timeout": 30
    }


@router.put("/settings/platform")
def update_platform_settings(
    site_name: Optional[str] = None,
    allow_registration: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update platform settings."""
    return {
        "site_name": site_name,
        "allow_registration": allow_registration,
        "updated": True
    }


@router.get("/settings/user")
def get_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user settings."""
    return {
        "email_notifications": True,
        "language": "en",
        "timezone": "UTC",
        "theme": "light"
    }


@router.put("/settings/user")
def update_user_settings(
    email_notifications: Optional[bool] = None,
    language: Optional[str] = None,
    timezone: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user settings."""
    return {
        "email_notifications": email_notifications,
        "language": language,
        "timezone": timezone,
        "updated": True
    }
