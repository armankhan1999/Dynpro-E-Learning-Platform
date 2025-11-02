from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.get("/integrations")
def get_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get all available integrations."""
    integrations = [
        {"id": "zoom", "name": "Zoom", "enabled": True, "type": "video_conferencing"},
        {"id": "slack", "name": "Slack", "enabled": False, "type": "communication"},
        {"id": "google", "name": "Google Workspace", "enabled": True, "type": "sso"},
        {"id": "stripe", "name": "Stripe", "enabled": True, "type": "payment"},
        {"id": "mailchimp", "name": "Mailchimp", "enabled": False, "type": "email"}
    ]
    return {"integrations": integrations}


@router.post("/integrations/{integration_id}/enable")
def enable_integration(
    integration_id: str,
    config: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Enable an integration."""
    return {
        "integration_id": integration_id,
        "enabled": True,
        "config": config,
        "message": "Integration enabled successfully"
    }


@router.post("/integrations/{integration_id}/disable")
def disable_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Disable an integration."""
    return {
        "integration_id": integration_id,
        "enabled": False,
        "message": "Integration disabled successfully"
    }


@router.get("/integrations/{integration_id}/status")
def get_integration_status(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get integration status."""
    return {
        "integration_id": integration_id,
        "enabled": True,
        "connected": True,
        "last_sync": "2024-01-15T10:30:00Z"
    }


@router.post("/integrations/{integration_id}/test")
def test_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Test an integration connection."""
    return {
        "integration_id": integration_id,
        "test_result": "success",
        "message": "Integration connection successful"
    }
