from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/scorm/upload")
def upload_scorm_package(
    file: UploadFile = File(...),
    course_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Upload a SCORM package."""
    return {
        "id": "scorm-1",
        "filename": file.filename,
        "course_id": str(course_id) if course_id else None,
        "status": "processing",
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.get("/scorm/{scorm_id}")
def get_scorm_package(
    scorm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get SCORM package details."""
    return {
        "id": str(scorm_id),
        "title": "SCORM Course Package",
        "version": "1.2",
        "status": "ready",
        "launch_url": f"/scorm/{scorm_id}/launch"
    }


@router.post("/scorm/{scorm_id}/launch")
def launch_scorm_package(
    scorm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Launch a SCORM package."""
    return {
        "scorm_id": str(scorm_id),
        "launch_url": f"https://scorm.example.com/player/{scorm_id}",
        "session_id": "session-123"
    }


@router.post("/scorm/{scorm_id}/track")
def track_scorm_progress(
    scorm_id: UUID,
    completion_status: str,
    score: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Track SCORM package progress."""
    return {
        "scorm_id": str(scorm_id),
        "user_id": str(current_user.id),
        "completion_status": completion_status,
        "score": score,
        "tracked_at": datetime.utcnow().isoformat()
    }


@router.get("/external-content")
def get_external_content(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get external content items."""
    items = [
        {
            "id": f"ext-{i}",
            "title": f"External Resource {i}",
            "type": "video",
            "url": f"https://example.com/resource-{i}",
            "provider": "YouTube"
        }
        for i in range(1, 6)
    ]
    return {"items": items[skip:skip + limit], "total": len(items)}


@router.post("/external-content")
def create_external_content(
    title: str,
    url: str,
    content_type: str,
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Add external content."""
    return {
        "id": "ext-1",
        "title": title,
        "url": url,
        "type": content_type,
        "provider": provider,
        "created_at": datetime.utcnow().isoformat()
    }


@router.put("/external-content/{content_id}")
def update_external_content(
    content_id: UUID,
    title: Optional[str] = None,
    url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Update external content."""
    return {
        "id": str(content_id),
        "title": title,
        "url": url,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/external-content/{content_id}")
def delete_external_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Delete external content."""
    return {"message": "External content deleted successfully"}
