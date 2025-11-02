from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.db.models.enrollment import EnrollmentStatus


class EnrollmentCreate(BaseModel):
    course_id: UUID


class EnrollmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    status: EnrollmentStatus
    progress_percentage: Decimal
    enrolled_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_accessed_at: Optional[datetime] = None
    certificate_issued: bool
    
    class Config:
        from_attributes = True


class ContentProgressCreate(BaseModel):
    content_item_id: UUID
    progress_percentage: Optional[Decimal] = 0
    time_spent_seconds: Optional[int] = 0
    last_position: Optional[int] = None


class ContentProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    progress_percentage: Optional[Decimal] = None
    time_spent_seconds: Optional[int] = None
    last_position: Optional[int] = None


class ContentProgressResponse(BaseModel):
    id: UUID
    enrollment_id: UUID
    content_item_id: UUID
    is_completed: bool
    progress_percentage: Decimal
    time_spent_seconds: int
    last_position: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
