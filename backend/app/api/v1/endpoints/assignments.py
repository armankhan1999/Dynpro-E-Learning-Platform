from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.assignment import (
    AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    AssignmentSubmissionCreate, AssignmentSubmissionUpdate, AssignmentSubmissionResponse,
    AssignmentGrade
)
from app.db.models.assignment import Assignment, AssignmentSubmission
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment_in: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new assignment."""
    assignment = Assignment(**assignment_in.dict())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    course_id: Optional[UUID] = None,
    module_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all assignments with optional filters."""
    query = select(Assignment)
    
    if course_id:
        query = query.where(Assignment.course_id == course_id)
    if module_id:
        query = query.where(Assignment.module_id == module_id)
    
    query = query.offset(skip).limit(limit)
    result = db.execute(query)
    assignments = result.scalars().all()
    return assignments


@router.get("/by-course/{course_id}", response_model=List[AssignmentResponse])
def get_assignments_by_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all assignments for a specific course."""
    result = db.execute(
        select(Assignment).where(Assignment.course_id == course_id)
    )
    assignments = result.scalars().all()
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get assignment by ID."""
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: UUID,
    assignment_update: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an assignment."""
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    update_data = assignment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)
    
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an assignment."""
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    db.delete(assignment)
    db.commit()


@router.post("/{assignment_id}/publish", response_model=AssignmentResponse)
def publish_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Publish an assignment."""
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Add publish logic here (e.g., set status, send notifications)
    assignment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assignment)
    return assignment


# Submission endpoints
@router.post("/{assignment_id}/submit", response_model=AssignmentSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: UUID,
    submission_in: AssignmentSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit an assignment."""
    # Check if assignment exists
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if already submitted
    existing_submission = db.execute(
        select(AssignmentSubmission).where(
            and_(
                AssignmentSubmission.assignment_id == assignment_id,
                AssignmentSubmission.user_id == current_user.id
            )
        )
    ).scalar_one_or_none()
    
    if existing_submission and not assignment.allow_late_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment already submitted"
        )
    
    # Create submission
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        user_id=current_user.id,
        **submission_in.dict()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/{assignment_id}/submissions")
def get_assignment_submissions(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all submissions for an assignment (instructor/admin only)."""
    from sqlalchemy.orm import joinedload

    result = db.execute(
        select(AssignmentSubmission, User).join(
            User, AssignmentSubmission.user_id == User.id
        ).where(
            AssignmentSubmission.assignment_id == assignment_id
        ).order_by(AssignmentSubmission.submitted_at.desc())
    )

    submissions_data = []
    for submission, user in result.all():
        submission_dict = {
            "id": str(submission.id),
            "assignment_id": str(submission.assignment_id),
            "user_id": str(submission.user_id),
            "student_id": str(submission.user_id),
            "student_name": f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.email,
            "student_email": user.email,
            "submission_text": submission.submission_text,
            "attachment_urls": submission.attachment_urls or [],
            "attachment_url": submission.attachment_urls[0] if submission.attachment_urls else None,
            "grade": submission.score,
            "score": submission.score,
            "feedback": submission.feedback,
            "graded_by": str(submission.graded_by) if submission.graded_by else None,
            "submitted_at": submission.submitted_at.isoformat(),
            "graded_at": submission.graded_at.isoformat() if submission.graded_at else None,
            "status": "graded" if submission.graded_at else "submitted"
        }
        submissions_data.append(submission_dict)

    return {"submissions": submissions_data}


@router.get("/{assignment_id}/submissions/{submission_id}", response_model=AssignmentSubmissionResponse)
def get_submission(
    assignment_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific submission."""
    result = db.execute(
        select(AssignmentSubmission).where(
            and_(
                AssignmentSubmission.id == submission_id,
                AssignmentSubmission.assignment_id == assignment_id
            )
        )
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user owns submission or is instructor/admin
    if submission.user_id != current_user.id and current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this submission"
        )
    
    return submission


@router.post("/{assignment_id}/submissions/{submission_id}/grade", response_model=AssignmentSubmissionResponse)
def grade_submission(
    assignment_id: UUID,
    submission_id: UUID,
    grade_data: AssignmentGrade,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Grade a submission (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to grade submissions"
        )
    
    result = db.execute(
        select(AssignmentSubmission).where(
            and_(
                AssignmentSubmission.id == submission_id,
                AssignmentSubmission.assignment_id == assignment_id
            )
        )
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission.score = grade_data.score
    submission.feedback = grade_data.feedback
    submission.graded_by = current_user.id
    submission.graded_at = datetime.utcnow()
    
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/my-submissions", response_model=List[AssignmentSubmissionResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all submissions by current user."""
    result = db.execute(
        select(AssignmentSubmission).where(
            AssignmentSubmission.user_id == current_user.id
        ).order_by(AssignmentSubmission.submitted_at.desc())
    )
    submissions = result.scalars().all()
    return submissions


@router.put("/{assignment_id}/submissions/{submission_id}", response_model=AssignmentSubmissionResponse)
def update_submission(
    assignment_id: UUID,
    submission_id: UUID,
    submission_update: AssignmentSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a submission (before grading)."""
    result = db.execute(
        select(AssignmentSubmission).where(
            and_(
                AssignmentSubmission.id == submission_id,
                AssignmentSubmission.assignment_id == assignment_id,
                AssignmentSubmission.user_id == current_user.id
            )
        )
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.graded_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update graded submission"
        )
    
    update_data = submission_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(submission, field, value)
    
    submission.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(submission)
    return submission


@router.post("/{assignment_id}/resubmit", response_model=AssignmentSubmissionResponse)
def resubmit_assignment(
    assignment_id: UUID,
    submission_in: AssignmentSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resubmit an assignment (if allowed)."""
    # Check if assignment exists and allows resubmission
    result = db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    if not assignment.allow_late_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resubmission not allowed for this assignment"
        )
    
    # Create new submission
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        user_id=current_user.id,
        **submission_in.dict()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/{assignment_id}/analytics")
def get_assignment_analytics(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analytics for an assignment (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view analytics"
        )
    
    # Get all submissions
    result = db.execute(
        select(AssignmentSubmission).where(
            AssignmentSubmission.assignment_id == assignment_id
        )
    )
    submissions = result.scalars().all()
    
    total_submissions = len(submissions)
    graded_submissions = len([s for s in submissions if s.graded_at])
    pending_submissions = total_submissions - graded_submissions
    
    scores = [float(s.score) for s in submissions if s.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    return {
        "assignment_id": assignment_id,
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "pending_submissions": pending_submissions,
        "average_score": avg_score,
        "highest_score": max(scores) if scores else 0,
        "lowest_score": min(scores) if scores else 0
    }
