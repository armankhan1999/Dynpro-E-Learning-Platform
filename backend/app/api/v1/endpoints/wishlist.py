from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()


@router.post("/wishlist/courses/{course_id}")
def add_to_wishlist(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add course to wishlist."""
    return {
        "id": "wishlist-1",
        "user_id": str(current_user.id),
        "course_id": str(course_id),
        "added_at": datetime.utcnow().isoformat()
    }


@router.delete("/wishlist/courses/{course_id}")
def remove_from_wishlist(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove course from wishlist."""
    return {"message": "Course removed from wishlist"}


@router.get("/wishlist")
def get_wishlist(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's wishlist."""
    items = [
        {
            "id": f"wishlist-{i}",
            "course_id": f"course-{i}",
            "course_title": f"Course {i}",
            "price": 99.99,
            "added_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 6)
    ]
    return {"items": items[skip:skip + limit], "total": len(items)}
