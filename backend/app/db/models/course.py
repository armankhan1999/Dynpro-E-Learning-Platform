from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from app.db.base_class import Base
import uuid
from datetime import datetime
import enum


class CourseStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class ContentType(str, enum.Enum):
    video = "video"
    document = "document"
    quiz = "quiz"
    assignment = "assignment"
    link = "link"


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    icon = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    thumbnail_url = Column(String(500))
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    status = Column(Enum(CourseStatus), default=CourseStatus.draft)
    duration_hours = Column(Integer)
    difficulty_level = Column(String(20))
    prerequisites = Column(ARRAY(Text))
    learning_objectives = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))
    is_featured = Column(Boolean, default=False)
    enrollment_limit = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)
    deleted_at = Column(DateTime)


class Module(Base):
    __tablename__ = "modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order_index = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContentItem(Base):
    __tablename__ = "content_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content_type = Column(Enum(ContentType), nullable=False)
    content_url = Column(String(500))
    content_data = Column(JSONB)
    duration_minutes = Column(Integer)
    order_index = Column(Integer, nullable=False)
    is_mandatory = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
