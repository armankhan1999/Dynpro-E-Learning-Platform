from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.db.base_class import Base
import uuid
from datetime import datetime


class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String(500))
    is_mandatory = Column(Boolean, default=False)
    target_roles = Column(ARRAY(Text))
    target_departments = Column(ARRAY(UUID(as_uuid=True)))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LearningPathCourse(Base):
    __tablename__ = "learning_path_courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_path_id = Column(UUID(as_uuid=True), ForeignKey("learning_paths.id", ondelete="CASCADE"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    order_index = Column(Integer, nullable=False)
    is_mandatory = Column(Boolean, default=True)


class LearningPathEnrollment(Base):
    __tablename__ = "learning_path_enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    learning_path_id = Column(UUID(as_uuid=True), ForeignKey("learning_paths.id"))
    progress_percentage = Column(Numeric(5, 2), default=0)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)


# Alias for backward compatibility
UserLearningPath = LearningPathEnrollment
