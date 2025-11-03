from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    ModuleCreate, ModuleUpdate, ModuleResponse,
    ContentItemCreate, ContentItemUpdate, ContentItemResponse
)
from app.db.models.course import Course, Module, ContentItem, CourseStatus
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new course."""
    # Generate slug from title
    import re
    slug = re.sub(r'[^\w\s-]', '', course_in.title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)

    # Ensure slug is unique
    counter = 1
    original_slug = slug
    while True:
        result = db.execute(select(Course).where(Course.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{original_slug}-{counter}"
        counter += 1

    # Set status based on is_published
    status_value = CourseStatus.published if course_in.is_published else CourseStatus.draft

    course_data = course_in.dict(exclude={'is_published'})
    course = Course(
        **course_data,
        slug=slug,
        instructor_id=current_user.id,
        status=status_value
    )

    if course_in.is_published:
        from datetime import datetime
        course.published_at = datetime.utcnow()

    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/", response_model=List[CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 20,
    status: CourseStatus = None,
    category_id: UUID = None,
    instructor_id: UUID = None,
    db: Session = Depends(get_db)
):
    """Get all courses with filters."""
    query = select(Course).where(Course.deleted_at.is_(None))

    if status:
        query = query.where(Course.status == status)
    if category_id:
        query = query.where(Course.category_id == category_id)
    if instructor_id:
        query = query.where(Course.instructor_id == instructor_id)

    query = query.offset(skip).limit(limit).order_by(Course.created_at.desc())
    result = db.execute(query)
    courses = result.scalars().all()
    return courses


@router.get("/my-courses", response_model=List[CourseResponse])
def get_my_courses(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get courses created by the current instructor."""
    query = select(Course).where(
        (Course.instructor_id == current_user.id) &
        (Course.deleted_at.is_(None))
    ).order_by(Course.created_at.desc()).offset(skip).limit(limit)

    result = db.execute(query)
    courses = result.scalars().all()
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get course by ID."""
    result = db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a course."""
    result = db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a course (soft delete)."""
    result = db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    from datetime import datetime
    course.deleted_at = datetime.utcnow()
    db.commit()


# Module endpoints
@router.post("/{course_id}/modules", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
def create_module(
    course_id: UUID,
    module_in: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new module for a course."""
    # Verify course exists
    result = db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    module = Module(**module_in.dict())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get("/{course_id}/modules")
def get_course_modules(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all modules for a course with their content items."""
    # Get all modules
    modules_result = db.execute(
        select(Module).where(Module.course_id == course_id).order_by(Module.order_index)
    )
    modules = modules_result.scalars().all()

    # Build response with content items
    modules_data = []
    for module in modules:
        # Get content items for this module
        content_result = db.execute(
            select(ContentItem).where(ContentItem.module_id == module.id).order_by(ContentItem.order_index)
        )
        content_items = content_result.scalars().all()

        module_dict = {
            "id": str(module.id),
            "course_id": str(module.course_id),
            "title": module.title,
            "description": module.description,
            "order_index": module.order_index,
            "is_locked": module.is_locked,
            "created_at": module.created_at.isoformat(),
            "updated_at": module.updated_at.isoformat(),
            "content_items": [
                {
                    "id": str(item.id),
                    "module_id": str(item.module_id),
                    "title": item.title,
                    "description": item.description,
                    "content_type": item.content_type.value,
                    "content_url": item.content_url,
                    "content_data": item.content_data,
                    "duration_minutes": item.duration_minutes,
                    "order_index": item.order_index,
                    "is_mandatory": item.is_mandatory,
                    "created_at": item.created_at.isoformat()
                }
                for item in content_items
            ]
        }
        modules_data.append(module_dict)

    return {"modules": modules_data}


@router.put("/{course_id}/modules/{module_id}", response_model=ModuleResponse)
def update_module(
    course_id: UUID,
    module_id: UUID,
    module_update: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a module."""
    result = db.execute(
        select(Module).where(
            (Module.id == module_id) & (Module.course_id == course_id)
        )
    )
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )

    update_data = module_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(module, field, value)

    db.commit()
    db.refresh(module)
    return module


@router.delete("/{course_id}/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    course_id: UUID,
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a module and all its content items."""
    result = db.execute(
        select(Module).where(
            (Module.id == module_id) & (Module.course_id == course_id)
        )
    )
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )

    db.delete(module)
    db.commit()


# Content Item endpoints
@router.post("/{course_id}/modules/{module_id}/content", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
def create_content_item(
    course_id: UUID,
    module_id: UUID,
    content_in: ContentItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new content item for a module."""
    # Verify module exists
    result = db.execute(
        select(Module).where(
            (Module.id == module_id) & (Module.course_id == course_id)
        )
    )
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )

    content = ContentItem(**content_in.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get("/{course_id}/modules/{module_id}/content", response_model=List[ContentItemResponse])
def get_module_content(
    course_id: UUID,
    module_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all content items for a module."""
    result = db.execute(
        select(ContentItem).where(ContentItem.module_id == module_id).order_by(ContentItem.order_index)
    )
    content_items = result.scalars().all()
    return content_items


@router.put("/{course_id}/modules/{module_id}/content/{content_id}", response_model=ContentItemResponse)
def update_content_item(
    course_id: UUID,
    module_id: UUID,
    content_id: UUID,
    content_update: ContentItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a content item."""
    result = db.execute(
        select(ContentItem).where(
            (ContentItem.id == content_id) & (ContentItem.module_id == module_id)
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )

    update_data = content_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return content


@router.delete("/{course_id}/modules/{module_id}/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content_item(
    course_id: UUID,
    module_id: UUID,
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a content item."""
    result = db.execute(
        select(ContentItem).where(
            (ContentItem.id == content_id) & (ContentItem.module_id == module_id)
        )
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )

    db.delete(content)
    db.commit()
