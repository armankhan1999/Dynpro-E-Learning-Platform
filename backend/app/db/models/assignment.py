from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.db.base_class import Base
import uuid
from datetime import datetime


class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    max_score = Column(Numeric(5, 2), default=100)
    due_date = Column(DateTime)
    allow_late_submission = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    submission_text = Column(Text)
    attachment_urls = Column(ARRAY(Text))
    score = Column(Numeric(5, 2))
    feedback = Column(Text)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    submitted_at = Column(DateTime, default=datetime.utcnow)
    graded_at = Column(DateTime)
