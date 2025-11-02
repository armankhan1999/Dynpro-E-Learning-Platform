from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.db.models.course import CourseStatus, ContentType


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    parent_id: Optional[UUID] = None


class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[UUID] = None
    duration_hours: Optional[int] = None
    difficulty_level: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class CourseCreate(CourseBase):
    slug: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category_id: Optional[UUID] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[int] = None
    difficulty_level: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class CourseResponse(CourseBase):
    id: UUID
    slug: str
    thumbnail_url: Optional[str] = None
    instructor_id: Optional[UUID] = None
    status: CourseStatus
    is_featured: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int


class ModuleCreate(ModuleBase):
    course_id: UUID


class ModuleResponse(ModuleBase):
    id: UUID
    course_id: UUID
    is_locked: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ContentItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentType
    content_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: int


class ContentItemCreate(ContentItemBase):
    module_id: UUID
    content_data: Optional[dict] = None


class ContentItemResponse(ContentItemBase):
    id: UUID
    module_id: UUID
    content_data: Optional[dict] = None
    is_mandatory: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
