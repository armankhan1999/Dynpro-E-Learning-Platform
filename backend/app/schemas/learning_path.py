from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    difficulty_level: Optional[str] = None


class LearningPathCreate(LearningPathBase):
    pass


class LearningPathUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    difficulty_level: Optional[str] = None
    is_published: Optional[bool] = None


class LearningPathResponse(LearningPathBase):
    id: UUID
    is_published: bool
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    courses_count: int
    enrollments_count: int
    
    class Config:
        from_attributes = True


class LearningPathCourseBase(BaseModel):
    course_id: UUID
    order_index: int
    is_mandatory: bool = True


class LearningPathCourseCreate(LearningPathCourseBase):
    pass


class LearningPathCourseResponse(LearningPathCourseBase):
    id: UUID
    learning_path_id: UUID
    
    class Config:
        from_attributes = True


class LearningPathEnrollmentResponse(BaseModel):
    id: UUID
    learning_path_id: UUID
    user_id: UUID
    progress_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
