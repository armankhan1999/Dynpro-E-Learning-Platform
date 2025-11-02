from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base_class import Base
import uuid
from datetime import datetime


class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollments.id"))
    certificate_number = Column(String(100), unique=True, nullable=False)
    verification_code = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    certificate_url = Column(String(500))
    is_revoked = Column(Boolean, default=False)
    cert_metadata = Column(JSONB)  # Renamed from 'metadata' to avoid SQLAlchemy reserved word
