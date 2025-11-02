from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class CertificateBase(BaseModel):
    certificate_number: str
    title: str
    description: Optional[str] = None


class CertificateCreate(BaseModel):
    enrollment_id: UUID
    template_id: Optional[UUID] = None


class CertificateResponse(CertificateBase):
    id: UUID
    user_id: UUID
    course_id: UUID
    enrollment_id: UUID
    issued_at: datetime
    expires_at: Optional[datetime] = None
    is_revoked: bool
    certificate_url: Optional[str] = None
    verification_code: str
    
    class Config:
        from_attributes = True


class CertificateVerification(BaseModel):
    certificate_number: str
    verification_code: str


class CertificateTemplate(BaseModel):
    id: UUID
    name: str
    template_html: str
    is_active: bool
    
    class Config:
        from_attributes = True
