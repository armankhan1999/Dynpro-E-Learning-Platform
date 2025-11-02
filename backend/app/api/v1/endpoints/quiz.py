from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/quizzes")
def create_quiz(
    title: str,
    course_id: UUID,
    passing_score: int,
    time_limit: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Create a quiz."""
    return {
        "id": "quiz-1",
        "title": title,
        "course_id": str(course_id),
        "passing_score": passing_score,
        "time_limit": time_limit,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/quizzes/{quiz_id}")
def get_quiz(
    quiz_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get quiz details."""
    return {
        "id": str(quiz_id),
        "title": "React Fundamentals Quiz",
        "passing_score": 70,
        "time_limit": 30,
        "questions_count": 10
    }


@router.put("/quizzes/{quiz_id}")
def update_quiz(
    quiz_id: UUID,
    title: Optional[str] = None,
    passing_score: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Update a quiz."""
    return {
        "id": str(quiz_id),
        "title": title,
        "passing_score": passing_score,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/quizzes/{quiz_id}")
def delete_quiz(
    quiz_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Delete a quiz."""
    return {"message": "Quiz deleted successfully"}


@router.post("/quizzes/{quiz_id}/questions")
def add_quiz_question(
    quiz_id: UUID,
    question_text: str,
    question_type: str,
    options: List[str],
    correct_answer: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Add a question to a quiz."""
    return {
        "id": "question-1",
        "quiz_id": str(quiz_id),
        "question_text": question_text,
        "type": question_type,
        "options": options,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/quizzes/{quiz_id}/questions")
def get_quiz_questions(
    quiz_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all questions for a quiz."""
    questions = [
        {
            "id": f"q-{i}",
            "quiz_id": str(quiz_id),
            "question_text": f"Question {i}?",
            "type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C", "Option D"]
        }
        for i in range(1, 11)
    ]
    return {"questions": questions, "total": len(questions)}


@router.post("/quizzes/{quiz_id}/attempt")
def start_quiz_attempt(
    quiz_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a quiz attempt."""
    return {
        "attempt_id": "attempt-1",
        "quiz_id": str(quiz_id),
        "user_id": str(current_user.id),
        "started_at": datetime.utcnow().isoformat(),
        "status": "in_progress"
    }


@router.post("/quizzes/attempts/{attempt_id}/submit")
def submit_quiz_attempt(
    attempt_id: UUID,
    answers: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit a quiz attempt."""
    return {
        "attempt_id": str(attempt_id),
        "score": 85,
        "passed": True,
        "submitted_at": datetime.utcnow().isoformat()
    }


@router.get("/quizzes/{quiz_id}/results")
def get_quiz_results(
    quiz_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get quiz results for current user."""
    return {
        "quiz_id": str(quiz_id),
        "attempts": 2,
        "best_score": 85,
        "average_score": 80,
        "passed": True
    }
