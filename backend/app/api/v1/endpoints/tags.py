from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.get("/tags")
def get_all_tags(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all tags."""
    tags = [
        {"id": f"tag-{i}", "name": f"Tag {i}", "usage_count": i * 10}
        for i in range(1, 21)
    ]
    return {"tags": tags[skip:skip + limit], "total": len(tags)}


@router.post("/tags")
def create_tag(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a new tag."""
    return {"id": "tag-1", "name": name, "usage_count": 0}


@router.put("/tags/{tag_id}")
def update_tag(
    tag_id: UUID,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update a tag."""
    return {"id": str(tag_id), "name": name}


@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete a tag."""
    return {"message": "Tag deleted successfully"}


@router.post("/courses/{course_id}/tags/{tag_id}")
def add_tag_to_course(
    course_id: UUID,
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Add a tag to a course."""
    return {"course_id": str(course_id), "tag_id": str(tag_id)}


@router.delete("/courses/{course_id}/tags/{tag_id}")
def remove_tag_from_course(
    course_id: UUID,
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Remove a tag from a course."""
    return {"message": "Tag removed from course"}
