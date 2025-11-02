from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    max_score: Optional[Decimal] = 100
    due_date: Optional[datetime] = None
    allow_late_submission: Optional[bool] = False


class AssignmentCreate(AssignmentBase):
    course_id: UUID
    module_id: Optional[UUID] = None


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    max_score: Optional[Decimal] = None
    due_date: Optional[datetime] = None
    allow_late_submission: Optional[bool] = None


class AssignmentResponse(AssignmentBase):
    id: UUID
    course_id: UUID
    module_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AssignmentSubmissionCreate(BaseModel):
    submission_text: Optional[str] = None
    attachment_urls: Optional[List[str]] = []


class AssignmentSubmissionUpdate(BaseModel):
    submission_text: Optional[str] = None
    attachment_urls: Optional[List[str]] = None


class AssignmentGrade(BaseModel):
    score: Decimal
    feedback: Optional[str] = None


class AssignmentSubmissionResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    user_id: UUID
    submission_text: Optional[str] = None
    attachment_urls: Optional[List[str]] = []
    score: Optional[Decimal] = None
    feedback: Optional[str] = None
    graded_by: Optional[UUID] = None
    submitted_at: datetime
    graded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
