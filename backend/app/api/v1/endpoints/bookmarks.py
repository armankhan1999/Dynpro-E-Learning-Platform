from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()


@router.post("/bookmarks/courses/{course_id}")
def bookmark_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bookmark a course."""
    return {
        "id": "bookmark-1",
        "user_id": str(current_user.id),
        "course_id": str(course_id),
        "created_at": datetime.utcnow().isoformat()
    }


@router.delete("/bookmarks/courses/{course_id}")
def remove_bookmark(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a bookmark."""
    return {"message": "Bookmark removed"}


@router.get("/bookmarks")
def get_user_bookmarks(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's bookmarked courses."""
    bookmarks = [
        {
            "id": f"bookmark-{i}",
            "course_id": f"course-{i}",
            "course_title": f"Course {i}",
            "created_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 6)
    ]
    return {"bookmarks": bookmarks[skip:skip + limit], "total": len(bookmarks)}
