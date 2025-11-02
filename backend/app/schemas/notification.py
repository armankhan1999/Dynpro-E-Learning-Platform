from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    link: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: UUID


class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    course_updates: bool = True
    assignment_reminders: bool = True
    discussion_replies: bool = True
    grade_notifications: bool = True
    certificate_notifications: bool = True
    
    class Config:
        from_attributes = True
