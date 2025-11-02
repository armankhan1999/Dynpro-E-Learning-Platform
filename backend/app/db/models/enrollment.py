from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import uuid
from datetime import datetime
import enum
from sqlalchemy import Enum


class EnrollmentStatus(str, enum.Enum):
    enrolled = "enrolled"
    in_progress = "in_progress"
    completed = "completed"
    dropped = "dropped"


class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.enrolled)
    progress_percentage = Column(Numeric(5, 2), default=0)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    last_accessed_at = Column(DateTime)
    certificate_issued = Column(Boolean, default=False)


class ContentProgress(Base):
    __tablename__ = "content_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollments.id", ondelete="CASCADE"))
    content_item_id = Column(UUID(as_uuid=True), ForeignKey("content_items.id"))
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Numeric(5, 2), default=0)
    time_spent_seconds = Column(Integer, default=0)
    last_position = Column(Integer)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
