from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from datetime import datetime
import secrets
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.enrollment import (
    EnrollmentCreate, EnrollmentResponse,
    ContentProgressCreate, ContentProgressUpdate, ContentProgressResponse
)
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.db.models.enrollment import Enrollment, ContentProgress, EnrollmentStatus
from app.db.models.course import Course, Module, ContentItem
from app.db.models.certificate import Certificate
from app.db.models.user import User
from app.db.models.note import Note

router = APIRouter()


def generate_certificate_number() -> str:
    """Generate a unique certificate number."""
    return f"DYN-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"


def generate_verification_code() -> str:
    """Generate a verification code."""
    return secrets.token_hex(8).upper()


def calculate_course_progress(db: Session, enrollment_id: UUID, course_id: UUID) -> float:
    """Calculate the progress percentage for a course enrollment."""
    # Get all content items for this course
    result = db.execute(
        select(func.count(ContentItem.id))
        .join(Module, Module.id == ContentItem.module_id)
        .where(Module.course_id == course_id)
    )
    total_items = result.scalar() or 0

    if total_items == 0:
        return 0.0

    # Get completed content items for this enrollment
    result = db.execute(
        select(func.count(ContentProgress.id))
        .where(
            (ContentProgress.enrollment_id == enrollment_id) &
            (ContentProgress.is_completed == True)
        )
    )
    completed_items = result.scalar() or 0

    return round((completed_items / total_items) * 100, 2)


def update_enrollment_progress(db: Session, enrollment_id: UUID, course_id: UUID):
    """Update enrollment progress and status."""
    progress = calculate_course_progress(db, enrollment_id, course_id)

    result = db.execute(
        select(Enrollment).where(Enrollment.id == enrollment_id)
    )
    enrollment = result.scalar_one_or_none()

    if enrollment:
        enrollment.progress_percentage = progress
        enrollment.last_accessed_at = datetime.utcnow()

        # Update status based on progress
        if progress == 0 and enrollment.status == EnrollmentStatus.enrolled:
            enrollment.status = EnrollmentStatus.enrolled
        elif progress > 0 and progress < 100:
            enrollment.status = EnrollmentStatus.in_progress
            if not enrollment.started_at:
                enrollment.started_at = datetime.utcnow()
        elif progress == 100:
            enrollment.status = EnrollmentStatus.completed
            if not enrollment.completed_at:
                enrollment.completed_at = datetime.utcnow()

                # Auto-generate certificate when course is completed
                if not enrollment.certificate_issued:
                    # Check if certificate already exists
                    cert_result = db.execute(
                        select(Certificate).where(Certificate.enrollment_id == enrollment_id)
                    )
                    existing_cert = cert_result.scalar_one_or_none()

                    if not existing_cert:
                        # Get course details for certificate
                        course_result = db.execute(
                            select(Course).where(Course.id == course_id)
                        )
                        course = course_result.scalar_one()

                        # Create certificate
                        certificate = Certificate(
                            user_id=enrollment.user_id,
                            course_id=course_id,
                            enrollment_id=enrollment_id,
                            certificate_number=generate_certificate_number(),
                            verification_code=generate_verification_code(),
                            title=f"Certificate of Completion - {course.title}",
                            description=f"This certifies that {enrollment.user_id} has successfully completed {course.title} offered by DynPro."
                        )
                        db.add(certificate)
                        enrollment.certificate_issued = True

        db.commit()
        db.refresh(enrollment)

    return enrollment


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    enrollment_in: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enroll current user in a course."""
    # Check if course exists
    result = db.execute(select(Course).where(Course.id == enrollment_in.course_id))
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if already enrolled
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.user_id == current_user.id) &
            (Enrollment.course_id == enrollment_in.course_id)
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
    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.get("/my-courses", response_model=List[EnrollmentResponse])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all enrollments for current user."""
    result = db.execute(
        select(Enrollment).where(Enrollment.user_id == current_user.id)
    )
    enrollments = result.scalars().all()
    return enrollments


@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
def get_enrollment(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get enrollment by ID."""
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.id == enrollment_id) &
            (Enrollment.user_id == current_user.id)
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
def create_content_progress(
    enrollment_id: UUID,
    progress_in: ContentProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update content progress."""
    # Check if enrollment exists and belongs to current user
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.id == enrollment_id) &
            (Enrollment.user_id == current_user.id)
        )
    )
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    # Check if progress already exists
    result = db.execute(
        select(ContentProgress).where(
            (ContentProgress.enrollment_id == enrollment_id) &
            (ContentProgress.content_item_id == progress_in.content_item_id)
        )
    )
    existing_progress = result.scalar_one_or_none()

    if existing_progress:
        # Update existing progress
        update_data = progress_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_progress, field, value)

        # Mark as completed if specified
        if hasattr(progress_in, 'is_completed') and progress_in.is_completed:
            existing_progress.is_completed = True
            existing_progress.completed_at = datetime.utcnow()
            existing_progress.progress_percentage = 100

        db.commit()
        db.refresh(existing_progress)

        # Update overall enrollment progress
        update_enrollment_progress(db, enrollment_id, enrollment.course_id)

        return existing_progress

    # Create new progress
    progress = ContentProgress(
        enrollment_id=enrollment_id,
        **progress_in.dict()
    )

    # Mark as completed if specified
    if progress.is_completed:
        progress.completed_at = datetime.utcnow()
        progress.progress_percentage = 100

    db.add(progress)
    db.commit()
    db.refresh(progress)

    # Update overall enrollment progress
    update_enrollment_progress(db, enrollment_id, enrollment.course_id)

    return progress


@router.get("/{enrollment_id}/progress", response_model=List[ContentProgressResponse])
def get_enrollment_progress(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all content progress for an enrollment."""
    result = db.execute(
        select(ContentProgress).where(ContentProgress.enrollment_id == enrollment_id)
    )
    progress_items = result.scalars().all()
    return progress_items


@router.post("/{enrollment_id}/content/{content_item_id}/complete", status_code=status.HTTP_200_OK)
def mark_content_complete(
    enrollment_id: UUID,
    content_item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a specific content item as complete."""
    # Verify enrollment belongs to current user
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.id == enrollment_id) &
            (Enrollment.user_id == current_user.id)
        )
    )
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    # Check if progress already exists
    result = db.execute(
        select(ContentProgress).where(
            (ContentProgress.enrollment_id == enrollment_id) &
            (ContentProgress.content_item_id == content_item_id)
        )
    )
    progress = result.scalar_one_or_none()

    if progress:
        # Update existing
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        progress.progress_percentage = 100
    else:
        # Create new
        progress = ContentProgress(
            enrollment_id=enrollment_id,
            content_item_id=content_item_id,
            is_completed=True,
            completed_at=datetime.utcnow(),
            progress_percentage=100
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    # Update overall enrollment progress
    updated_enrollment = update_enrollment_progress(db, enrollment_id, enrollment.course_id)

    return {
        "success": True,
        "content_item_id": str(content_item_id),
        "enrollment_progress": float(updated_enrollment.progress_percentage),
        "enrollment_status": updated_enrollment.status.value
    }


@router.get("/{enrollment_id}/notes", response_model=List[NoteResponse])
def get_notes(
    enrollment_id: UUID,
    content_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get notes for an enrollment. Optionally filter by content_id."""
    # Verify enrollment belongs to current user
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.id == enrollment_id) &
            (Enrollment.user_id == current_user.id)
        )
    )
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    # Build query to get notes
    query = select(Note).where(Note.enrollment_id == enrollment_id)
    if content_id:
        query = query.where(Note.content_id == content_id)

    result = db.execute(query.order_by(Note.created_at.desc()))
    notes = result.scalars().all()
    return notes


@router.post("/{enrollment_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def add_note(
    enrollment_id: UUID,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a note to an enrollment."""
    # Verify enrollment belongs to current user
    result = db.execute(
        select(Enrollment).where(
            (Enrollment.id == enrollment_id) &
            (Enrollment.user_id == current_user.id)
        )
    )
    enrollment = result.scalar_one_or_none()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    # Create note
    note = Note(
        enrollment_id=enrollment_id,
        user_id=current_user.id,
        content=note_in.content,
        content_id=note_in.content_id
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return note


@router.put("/{enrollment_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    enrollment_id: UUID,
    note_id: UUID,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a note."""
    # Verify note exists and belongs to current user
    result = db.execute(
        select(Note).where(
            (Note.id == note_id) &
            (Note.enrollment_id == enrollment_id) &
            (Note.user_id == current_user.id)
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Update note content
    note.content = note_in.content
    db.commit()
    db.refresh(note)

    return note


@router.delete("/{enrollment_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    enrollment_id: UUID,
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a note."""
    # Verify note exists and belongs to current user
    result = db.execute(
        select(Note).where(
            (Note.id == note_id) &
            (Note.enrollment_id == enrollment_id) &
            (Note.user_id == current_user.id)
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Delete note
    db.delete(note)
    db.commit()

    return None
