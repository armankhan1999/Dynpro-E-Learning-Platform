from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    ModuleCreate, ModuleResponse,
    ContentItemCreate, ContentItemResponse
)
from app.db.models.course import Course, Module, ContentItem, CourseStatus
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new course."""
    course = Course(
        **course_in.dict(),
        instructor_id=current_user.id
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.get("/", response_model=List[CourseResponse])
async def get_courses(
    skip: int = 0,
    limit: int = 20,
    status: CourseStatus = None,
    category_id: UUID = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all courses with filters."""
    query = select(Course)
    
    if status:
        query = query.where(Course.status == status)
    if category_id:
        query = query.where(Course.category_id == category_id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    courses = result.scalars().all()
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get course by ID."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return course


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a course."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a course (soft delete)."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    from datetime import datetime
    course.deleted_at = datetime.utcnow()
    await db.commit()


# Module endpoints
@router.post("/{course_id}/modules", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(
    course_id: UUID,
    module_in: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new module for a course."""
    module = Module(**module_in.dict())
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


@router.get("/{course_id}/modules", response_model=List[ModuleResponse])
async def get_course_modules(
    course_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get all modules for a course."""
    result = await db.execute(
        select(Module).where(Module.course_id == course_id).order_by(Module.order_index)
    )
    modules = result.scalars().all()
    return modules


# Content Item endpoints
@router.post("/modules/{module_id}/content", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
async def create_content_item(
    module_id: UUID,
    content_in: ContentItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new content item for a module."""
    content = ContentItem(**content_in.dict())
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return content


@router.get("/modules/{module_id}/content", response_model=List[ContentItemResponse])
async def get_module_content(
    module_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get all content items for a module."""
    result = await db.execute(
        select(ContentItem).where(ContentItem.module_id == module_id).order_by(ContentItem.order_index)
    )
    content_items = result.scalars().all()
    return content_items
