from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/courses/{course_id}/modules")
def create_module(
    course_id: UUID,
    title: str,
    description: str,
    order: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Create a course module."""
    return {
        "id": "module-1",
        "course_id": str(course_id),
        "title": title,
        "description": description,
        "order": order,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/courses/{course_id}/modules")
def get_course_modules(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all modules for a course."""
    modules = [
        {
            "id": f"module-{i}",
            "course_id": str(course_id),
            "title": f"Module {i}",
            "description": f"Description for module {i}",
            "order": i,
            "lessons_count": 5
        }
        for i in range(1, 6)
    ]
    return {"modules": modules, "total": len(modules)}


@router.put("/modules/{module_id}")
def update_module(
    module_id: UUID,
    title: Optional[str] = None,
    description: Optional[str] = None,
    order: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Update a module."""
    return {
        "id": str(module_id),
        "title": title,
        "description": description,
        "order": order,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/modules/{module_id}")
def delete_module(
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Delete a module."""
    return {"message": "Module deleted successfully"}


@router.post("/modules/{module_id}/lessons")
def create_lesson(
    module_id: UUID,
    title: str,
    content_type: str,
    content_url: Optional[str] = None,
    duration: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Create a lesson in a module."""
    return {
        "id": "lesson-1",
        "module_id": str(module_id),
        "title": title,
        "content_type": content_type,
        "content_url": content_url,
        "duration": duration,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/modules/{module_id}/lessons")
def get_module_lessons(
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all lessons in a module."""
    lessons = [
        {
            "id": f"lesson-{i}",
            "module_id": str(module_id),
            "title": f"Lesson {i}",
            "content_type": "video",
            "duration": 15,
            "order": i
        }
        for i in range(1, 6)
    ]
    return {"lessons": lessons, "total": len(lessons)}


@router.put("/lessons/{lesson_id}")
def update_lesson(
    lesson_id: UUID,
    title: Optional[str] = None,
    content_url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Update a lesson."""
    return {
        "id": str(lesson_id),
        "title": title,
        "content_url": content_url,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Delete a lesson."""
    return {"message": "Lesson deleted successfully"}


@router.post("/lessons/{lesson_id}/complete")
def mark_lesson_complete(
    lesson_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a lesson as complete."""
    return {
        "lesson_id": str(lesson_id),
        "user_id": str(current_user.id),
        "completed": True,
        "completed_at": datetime.utcnow().isoformat()
    }


@router.get("/content/{content_id}")
def get_content_item(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific content item."""
    return {
        "id": str(content_id),
        "title": "Introduction to React",
        "type": "video",
        "url": "https://example.com/video.mp4",
        "duration": 1800,
        "description": "Learn the basics of React"
    }


@router.post("/content/upload")
def upload_content(
    file: UploadFile = File(...),
    title: str = None,
    content_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Upload content file."""
    return {
        "id": "content-1",
        "filename": file.filename,
        "title": title,
        "type": content_type,
        "url": f"/uploads/{file.filename}",
        "uploaded_at": datetime.utcnow().isoformat()
    }
