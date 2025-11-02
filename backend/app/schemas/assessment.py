from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.db.models.assessment import QuestionType


class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: Optional[dict] = None
    explanation: Optional[str] = None
    points: Optional[Decimal] = 1


class QuestionCreate(QuestionBase):
    correct_answer: dict
    order_index: Optional[int] = 0


class QuestionResponse(QuestionBase):
    id: UUID
    assessment_id: UUID
    order_index: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuestionWithAnswer(QuestionResponse):
    correct_answer: dict


class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    pass_percentage: Optional[Decimal] = 60
    max_attempts: Optional[int] = 3
    time_limit_minutes: Optional[int] = None
    shuffle_questions: Optional[bool] = False
    show_correct_answers: Optional[bool] = True


class AssessmentCreate(AssessmentBase):
    course_id: UUID
    module_id: Optional[UUID] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    pass_percentage: Optional[Decimal] = None
    max_attempts: Optional[int] = None
    time_limit_minutes: Optional[int] = None
    shuffle_questions: Optional[bool] = None
    show_correct_answers: Optional[bool] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class AssessmentResponse(AssessmentBase):
    id: UUID
    course_id: UUID
    module_id: Optional[UUID] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AssessmentWithQuestions(AssessmentResponse):
    questions: List[QuestionResponse] = []


class AssessmentAttemptCreate(BaseModel):
    assessment_id: UUID


class AssessmentSubmission(BaseModel):
    answers: dict


class AssessmentAttemptResponse(BaseModel):
    id: UUID
    assessment_id: UUID
    user_id: UUID
    attempt_number: int
    score: Optional[Decimal] = None
    passed: bool
    answers: dict
    started_at: datetime
    submitted_at: Optional[datetime] = None
    time_taken_seconds: Optional[int] = None
    
    class Config:
        from_attributes = True
