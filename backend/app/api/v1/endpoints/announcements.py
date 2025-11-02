from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/announcements")
def create_announcement(
    title: str,
    content: str,
    target_audience: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create an announcement."""
    return {
        "id": "announcement-1",
        "title": title,
        "content": content,
        "target_audience": target_audience,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/announcements")
def get_announcements(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all announcements."""
    announcements = [
        {
            "id": f"ann-{i}",
            "title": f"Announcement {i}",
            "content": f"Content {i}",
            "created_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 6)
    ]
    return {"announcements": announcements[skip:skip + limit], "total": len(announcements)}


@router.get("/announcements/{announcement_id}")
def get_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get announcement details."""
    return {
        "id": str(announcement_id),
        "title": "Platform Update",
        "content": "We have exciting new features!",
        "created_at": datetime.utcnow().isoformat()
    }


@router.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: UUID,
    title: Optional[str] = None,
    content: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update an announcement."""
    return {
        "id": str(announcement_id),
        "title": title,
        "content": content,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete an announcement."""
    return {"message": "Announcement deleted successfully"}
