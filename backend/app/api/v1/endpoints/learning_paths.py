from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.learning_path import (
    LearningPathCreate, LearningPathUpdate, LearningPathResponse,
    LearningPathCourseCreate, LearningPathCourseResponse,
    LearningPathEnrollmentResponse
)
from app.db.models.learning_path import LearningPath, LearningPathCourse, LearningPathEnrollment
from app.db.models.course import Course
from app.db.models.enrollment import Enrollment
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=LearningPathResponse, status_code=status.HTTP_201_CREATED)
def create_learning_path(
    path_in: LearningPathCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new learning path (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create learning paths"
        )
    
    learning_path = LearningPath(
        created_by=current_user.id,
        **path_in.dict()
    )
    db.add(learning_path)
    db.commit()
    db.refresh(learning_path)
    return learning_path


@router.get("/", response_model=List[LearningPathResponse])
def get_learning_paths(
    published_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all learning paths."""
    query = select(LearningPath)
    
    if published_only and current_user.role not in ['instructor', 'admin', 'super_admin']:
        query = query.where(LearningPath.is_published == True)
    
    query = query.order_by(LearningPath.created_at.desc()).offset(skip).limit(limit)
    
    result = db.execute(query)
    paths = result.scalars().all()
    return paths


@router.get("/recommended", response_model=List[LearningPathResponse])
def get_recommended_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get recommended learning paths for current user."""
    # Simple recommendation: return published paths
    # In production, this would use ML/AI for personalization
    result = db.execute(
        select(LearningPath)
        .where(LearningPath.is_published == True)
        .order_by(LearningPath.enrollments_count.desc())
        .limit(10)
    )
    paths = result.scalars().all()
    return paths


@router.get("/my-paths", response_model=List[LearningPathEnrollmentResponse])
def get_my_learning_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all learning paths enrolled by current user."""
    result = db.execute(
        select(LearningPathEnrollment)
        .where(LearningPathEnrollment.user_id == current_user.id)
        .order_by(LearningPathEnrollment.enrolled_at.desc())
    )
    enrollments = result.scalars().all()
    return enrollments


@router.get("/{path_id}", response_model=LearningPathResponse)
def get_learning_path(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get learning path by ID."""
    result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check if published or user is authorized
    if not path.is_published and current_user.role not in ['instructor', 'admin', 'super_admin']:
        if path.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this learning path"
            )
    
    return path


@router.put("/{path_id}", response_model=LearningPathResponse)
def update_learning_path(
    path_id: UUID,
    path_update: LearningPathUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a learning path."""
    result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this learning path"
        )
    
    update_data = path_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(path, field, value)
    
    path.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(path)
    return path


@router.delete("/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_path(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a learning path."""
    result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this learning path"
        )
    
    db.delete(path)
    db.commit()


@router.post("/{path_id}/publish", response_model=LearningPathResponse)
def publish_learning_path(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Publish a learning path."""
    result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this learning path"
        )
    
    path.is_published = True
    path.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(path)
    return path


@router.post("/{path_id}/duplicate", response_model=LearningPathResponse)
def duplicate_learning_path(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Duplicate a learning path (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to duplicate learning paths"
        )
    
    # Get original path
    result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    original_path = result.scalar_one_or_none()
    
    if not original_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Create duplicate
    new_path = LearningPath(
        title=f"{original_path.title} (Copy)",
        description=original_path.description,
        duration_weeks=original_path.duration_weeks,
        difficulty_level=original_path.difficulty_level,
        created_by=current_user.id,
        is_published=False
    )
    db.add(new_path)
    db.flush()
    
    # Copy courses
    courses_result = db.execute(
        select(LearningPathCourse).where(LearningPathCourse.learning_path_id == path_id)
    )
    courses = courses_result.scalars().all()
    
    for course in courses:
        new_course = LearningPathCourse(
            learning_path_id=new_path.id,
            course_id=course.course_id,
            order_index=course.order_index,
            is_mandatory=course.is_mandatory
        )
        db.add(new_course)
    
    db.commit()
    db.refresh(new_path)
    return new_path


# Course management endpoints
@router.post("/{path_id}/courses", response_model=LearningPathCourseResponse, status_code=status.HTTP_201_CREATED)
def add_course_to_path(
    path_id: UUID,
    course_data: LearningPathCourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a course to a learning path."""
    # Check if path exists
    path_result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = path_result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this learning path"
        )
    
    # Check if course exists
    course_result = db.execute(select(Course).where(Course.id == course_data.course_id))
    if not course_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Add course to path
    path_course = LearningPathCourse(
        learning_path_id=path_id,
        **course_data.dict()
    )
    db.add(path_course)
    
    # Update courses count
    path.courses_count += 1
    
    db.commit()
    db.refresh(path_course)
    return path_course


@router.get("/{path_id}/courses", response_model=List[LearningPathCourseResponse])
def get_path_courses(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all courses in a learning path."""
    result = db.execute(
        select(LearningPathCourse)
        .where(LearningPathCourse.learning_path_id == path_id)
        .order_by(LearningPathCourse.order_index)
    )
    courses = result.scalars().all()
    return courses


@router.delete("/{path_id}/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_course_from_path(
    path_id: UUID,
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a course from a learning path."""
    # Get path
    path_result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = path_result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this learning path"
        )
    
    # Find and delete course
    result = db.execute(
        select(LearningPathCourse).where(
            and_(
                LearningPathCourse.learning_path_id == path_id,
                LearningPathCourse.course_id == course_id
            )
        )
    )
    path_course = result.scalar_one_or_none()
    
    if not path_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found in learning path"
        )
    
    db.delete(path_course)
    path.courses_count = max(0, path.courses_count - 1)
    
    db.commit()


@router.post("/{path_id}/courses/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_path_courses(
    path_id: UUID,
    course_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reorder courses in a learning path."""
    # Get path
    path_result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = path_result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Check authorization
    if path.created_by != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this learning path"
        )
    
    # Update order
    for item in course_orders:
        course_id = UUID(item['course_id'])
        new_order = item['order_index']
        
        result = db.execute(
            select(LearningPathCourse).where(
                and_(
                    LearningPathCourse.learning_path_id == path_id,
                    LearningPathCourse.course_id == course_id
                )
            )
        )
        path_course = result.scalar_one_or_none()
        
        if path_course:
            path_course.order_index = new_order
    
    db.commit()


# Enrollment endpoints
@router.post("/{path_id}/enroll", response_model=LearningPathEnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_learning_path(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enroll in a learning path."""
    # Check if path exists and is published
    path_result = db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = path_result.scalar_one_or_none()
    
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    if not path.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Learning path is not published"
        )
    
    # Check if already enrolled
    existing_enrollment = db.execute(
        select(LearningPathEnrollment).where(
            and_(
                LearningPathEnrollment.learning_path_id == path_id,
                LearningPathEnrollment.user_id == current_user.id
            )
        )
    ).scalar_one_or_none()
    
    if existing_enrollment:
        return existing_enrollment
    
    # Create enrollment
    enrollment = LearningPathEnrollment(
        learning_path_id=path_id,
        user_id=current_user.id
    )
    db.add(enrollment)
    
    # Update enrollments count
    path.enrollments_count += 1
    
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/{path_id}/progress")
def get_learning_path_progress(
    path_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get progress in a learning path."""
    # Get enrollment
    enrollment_result = db.execute(
        select(LearningPathEnrollment).where(
            and_(
                LearningPathEnrollment.learning_path_id == path_id,
                LearningPathEnrollment.user_id == current_user.id
            )
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enrolled in this learning path"
        )
    
    # Get all courses in path
    courses_result = db.execute(
        select(LearningPathCourse)
        .where(LearningPathCourse.learning_path_id == path_id)
        .order_by(LearningPathCourse.order_index)
    )
    path_courses = courses_result.scalars().all()
    
    # Get user's course enrollments
    course_ids = [pc.course_id for pc in path_courses]
    enrollments_result = db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id.in_(course_ids)
            )
        )
    )
    course_enrollments = {e.course_id: e for e in enrollments_result.scalars().all()}
    
    # Calculate progress
    total_courses = len(path_courses)
    completed_courses = sum(
        1 for pc in path_courses
        if pc.course_id in course_enrollments and course_enrollments[pc.course_id].status == 'completed'
    )
    
    progress_percentage = (completed_courses / total_courses * 100) if total_courses > 0 else 0
    
    # Update enrollment progress
    enrollment.progress_percentage = progress_percentage
    if progress_percentage == 100 and not enrollment.completed_at:
        enrollment.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "learning_path_id": path_id,
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "progress_percentage": progress_percentage,
        "enrolled_at": enrollment.enrolled_at,
        "completed_at": enrollment.completed_at
    }
