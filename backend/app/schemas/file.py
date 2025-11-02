from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class FileBase(BaseModel):
    filename: str
    file_type: str
    file_size: int
    mime_type: str


class FileUpload(BaseModel):
    file_type: str  # video, document, image, etc.
    folder: Optional[str] = None


class FileResponse(FileBase):
    id: UUID
    file_path: str
    file_url: str
    uploaded_by: UUID
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class VideoProcessingStatus(BaseModel):
    file_id: UUID
    status: str  # processing, completed, failed
    progress: int
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    
    class Config:
        from_attributes = True
