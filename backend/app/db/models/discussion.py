from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import uuid
from datetime import datetime


class Discussion(Base):
    __tablename__ = "discussions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime)


class DiscussionReply(Base):
    __tablename__ = "discussion_replies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id", ondelete="CASCADE"))
    parent_reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"))
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_solution = Column(Boolean, default=False)
    upvotes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime)


class DiscussionUpvote(Base):
    __tablename__ = "discussion_upvotes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
