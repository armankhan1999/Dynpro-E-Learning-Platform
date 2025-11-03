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
    category: Optional[str] = None
    category_id: Optional[UUID] = None
    duration_hours: Optional[int] = None
    difficulty_level: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    intro_video_url: Optional[str] = None
    is_published: Optional[bool] = False
    max_students: Optional[int] = None
    language: Optional[str] = 'English'
    level: Optional[str] = 'beginner'


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    intro_video_url: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[UUID] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[int] = None
    difficulty_level: Optional[str] = None
    level: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    max_students: Optional[int] = None
    language: Optional[str] = None


class CourseResponse(CourseBase):
    id: UUID
    slug: Optional[str] = None
    instructor_id: Optional[UUID] = None
    status: CourseStatus
    is_featured: bool
    enrollment_limit: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int


class ModuleCreate(ModuleBase):
    course_id: UUID


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


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


class ContentItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[ContentType] = None
    content_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: Optional[int] = None
    content_data: Optional[dict] = None


class ContentItemResponse(ContentItemBase):
    id: UUID
    module_id: UUID
    content_data: Optional[dict] = None
    is_mandatory: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
