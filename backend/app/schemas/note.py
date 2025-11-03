from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class NoteBase(BaseModel):
    content: str
    content_id: Optional[UUID] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: str


class NoteResponse(NoteBase):
    id: UUID
    enrollment_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
