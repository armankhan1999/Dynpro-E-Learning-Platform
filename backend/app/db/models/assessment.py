from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base_class import Base
import uuid
from datetime import datetime
import enum


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    true_false = "true_false"
    short_answer = "short_answer"
    essay = "essay"


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    pass_percentage = Column(Numeric(5, 2), default=60)
    max_attempts = Column(Integer, default=3)
    time_limit_minutes = Column(Integer)
    shuffle_questions = Column(Boolean, default=False)
    show_correct_answers = Column(Boolean, default=True)
    available_from = Column(DateTime)
    available_until = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    options = Column(JSONB)
    correct_answer = Column(JSONB)
    explanation = Column(Text)
    points = Column(Numeric(5, 2), default=1)
    order_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    attempt_number = Column(Integer, nullable=False)
    score = Column(Numeric(5, 2))
    passed = Column(Boolean, default=False)
    answers = Column(JSONB)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime)
    time_taken_seconds = Column(Integer)
