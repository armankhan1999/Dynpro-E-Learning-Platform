from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.enrollment import (
    EnrollmentCreate, EnrollmentResponse,
    ContentProgressCreate, ContentProgressUpdate, ContentProgressResponse
)
from app.db.models.enrollment import Enrollment, ContentProgress, EnrollmentStatus
from app.db.models.course import Course
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    enrollment_in: EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enroll current user in a course."""
    # Check if course exists
    result = await db.execute(select(Course).where(Course.id == enrollment_in.course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if already enrolled
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == enrollment_in.course_id
        )
    )
    existing_enrollment = result.scalar_one_or_none()
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Create enrollment
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=enrollment_in.course_id
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    
    return enrollment


@router.get("/my-courses", response_model=List[EnrollmentResponse])
async def get_my_enrollments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all enrollments for current user."""
    result = await db.execute(
        select(Enrollment).where(Enrollment.user_id == current_user.id)
    )
    enrollments = result.scalars().all()
    return enrollments


@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
async def get_enrollment(
    enrollment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get enrollment by ID."""
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.id == enrollment_id,
            Enrollment.user_id == current_user.id
        )
    )
    enrollment = result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    return enrollment


@router.post("/{enrollment_id}/progress", response_model=ContentProgressResponse, status_code=status.HTTP_201_CREATED)
async def create_content_progress(
    enrollment_id: UUID,
    progress_in: ContentProgressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update content progress."""
    # Check if enrollment exists and belongs to current user
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.id == enrollment_id,
            Enrollment.user_id == current_user.id
        )
    )
    enrollment = result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Check if progress already exists
    result = await db.execute(
        select(ContentProgress).where(
            ContentProgress.enrollment_id == enrollment_id,
            ContentProgress.content_item_id == progress_in.content_item_id
        )
    )
    existing_progress = result.scalar_one_or_none()
    
    if existing_progress:
        # Update existing progress
        update_data = progress_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_progress, field, value)
        await db.commit()
        await db.refresh(existing_progress)
        return existing_progress
    
    # Create new progress
    progress = ContentProgress(
        enrollment_id=enrollment_id,
        **progress_in.dict()
    )
    db.add(progress)
    await db.commit()
    await db.refresh(progress)
    
    return progress


@router.get("/{enrollment_id}/progress", response_model=List[ContentProgressResponse])
async def get_enrollment_progress(
    enrollment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all content progress for an enrollment."""
    result = await db.execute(
        select(ContentProgress).where(ContentProgress.enrollment_id == enrollment_id)
    )
    progress_items = result.scalars().all()
    return progress_items
