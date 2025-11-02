from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.assessment import (
    AssessmentCreate, AssessmentUpdate, AssessmentResponse, AssessmentWithQuestions,
    QuestionCreate, QuestionResponse, QuestionWithAnswer,
    AssessmentAttemptCreate, AssessmentSubmission, AssessmentAttemptResponse
)
from app.db.models.assessment import Assessment, Question, AssessmentAttempt
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_in: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new assessment."""
    assessment = Assessment(**assessment_in.dict())
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.get("/", response_model=List[AssessmentResponse])
async def get_assessments(
    course_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all assessments with optional course filter."""
    query = select(Assessment)
    
    if course_id:
        query = query.where(Assessment.course_id == course_id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    assessments = result.scalars().all()
    return assessments


@router.get("/{assessment_id}", response_model=AssessmentWithQuestions)
async def get_assessment(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get assessment with questions."""
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Get questions
    questions_result = await db.execute(
        select(Question).where(Question.assessment_id == assessment_id).order_by(Question.order_index)
    )
    questions = questions_result.scalars().all()
    
    # Don't include correct answers for learners
    assessment_dict = AssessmentResponse.from_orm(assessment).dict()
    assessment_dict['questions'] = [QuestionResponse.from_orm(q) for q in questions]
    
    return assessment_dict


@router.put("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    assessment_update: AssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an assessment."""
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    update_data = assessment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assessment, field, value)
    
    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an assessment."""
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    await db.delete(assessment)
    await db.commit()


# Question endpoints
@router.post("/{assessment_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    assessment_id: UUID,
    question_in: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a question to an assessment."""
    # Verify assessment exists
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    question = Question(assessment_id=assessment_id, **question_in.dict())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.get("/{assessment_id}/questions", response_model=List[QuestionResponse])
async def get_questions(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all questions for an assessment."""
    result = await db.execute(
        select(Question).where(Question.assessment_id == assessment_id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    return questions


@router.put("/{assessment_id}/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    assessment_id: UUID,
    question_id: UUID,
    question_update: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a question."""
    result = await db.execute(
        select(Question).where(
            Question.id == question_id,
            Question.assessment_id == assessment_id
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    update_data = question_update.dict()
    for field, value in update_data.items():
        setattr(question, field, value)
    
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/{assessment_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    assessment_id: UUID,
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a question."""
    result = await db.execute(
        select(Question).where(
            Question.id == question_id,
            Question.assessment_id == assessment_id
        )
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    await db.delete(question)
    await db.commit()


# Assessment attempt endpoints
@router.post("/{assessment_id}/start", response_model=AssessmentAttemptResponse)
async def start_assessment(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a new assessment attempt."""
    # Check if assessment exists
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Check attempt limit
    attempts_result = await db.execute(
        select(func.count(AssessmentAttempt.id)).where(
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.user_id == current_user.id
        )
    )
    attempt_count = attempts_result.scalar()
    
    if attempt_count >= assessment.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum attempts ({assessment.max_attempts}) reached"
        )
    
    # Create new attempt
    attempt = AssessmentAttempt(
        assessment_id=assessment_id,
        user_id=current_user.id,
        attempt_number=attempt_count + 1,
        answers={}
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt


@router.post("/{assessment_id}/submit", response_model=AssessmentAttemptResponse)
async def submit_assessment(
    assessment_id: UUID,
    submission: AssessmentSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit an assessment attempt."""
    # Get the latest attempt
    result = await db.execute(
        select(AssessmentAttempt).where(
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.user_id == current_user.id,
            AssessmentAttempt.submitted_at == None
        ).order_by(AssessmentAttempt.started_at.desc())
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active attempt found"
        )
    
    # Get assessment and questions
    assessment_result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = assessment_result.scalar_one()
    
    questions_result = await db.execute(select(Question).where(Question.assessment_id == assessment_id))
    questions = questions_result.scalars().all()
    
    # Calculate score
    total_points = sum(q.points for q in questions)
    earned_points = 0
    
    for question in questions:
        question_id = str(question.id)
        if question_id in submission.answers:
            user_answer = submission.answers[question_id]
            correct_answer = question.correct_answer
            
            # Simple comparison (can be enhanced based on question type)
            if user_answer == correct_answer:
                earned_points += question.points
    
    score = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = score >= assessment.pass_percentage
    
    # Update attempt
    attempt.answers = submission.answers
    attempt.score = score
    attempt.passed = passed
    attempt.submitted_at = datetime.utcnow()
    attempt.time_taken_seconds = int((datetime.utcnow() - attempt.started_at).total_seconds())
    
    await db.commit()
    await db.refresh(attempt)
    return attempt


@router.get("/{assessment_id}/attempts", response_model=List[AssessmentAttemptResponse])
async def get_attempts(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all attempts for an assessment by current user."""
    result = await db.execute(
        select(AssessmentAttempt).where(
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.user_id == current_user.id
        ).order_by(AssessmentAttempt.started_at.desc())
    )
    attempts = result.scalars().all()
    return attempts


@router.get("/{assessment_id}/attempts/{attempt_id}", response_model=AssessmentAttemptResponse)
async def get_attempt(
    assessment_id: UUID,
    attempt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific attempt."""
    result = await db.execute(
        select(AssessmentAttempt).where(
            AssessmentAttempt.id == attempt_id,
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.user_id == current_user.id
        )
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    return attempt
