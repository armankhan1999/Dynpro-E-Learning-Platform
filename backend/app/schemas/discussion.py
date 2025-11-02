from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DiscussionBase(BaseModel):
    title: str
    content: str
    category: Optional[str] = None


class DiscussionCreate(DiscussionBase):
    course_id: Optional[UUID] = None


class DiscussionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


class DiscussionResponse(DiscussionBase):
    id: UUID
    course_id: Optional[UUID] = None
    user_id: UUID
    is_pinned: bool
    is_locked: bool
    is_resolved: bool
    upvotes_count: int
    replies_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ReplyBase(BaseModel):
    content: str


class ReplyCreate(ReplyBase):
    pass


class ReplyUpdate(BaseModel):
    content: Optional[str] = None


class ReplyResponse(ReplyBase):
    id: UUID
    discussion_id: UUID
    user_id: UUID
    parent_reply_id: Optional[UUID] = None
    is_solution: bool
    upvotes_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DiscussionWithReplies(DiscussionResponse):
    replies: List[ReplyResponse] = []
