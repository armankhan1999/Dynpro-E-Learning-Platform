from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
import secrets
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.certificate import (
    CertificateCreate, CertificateResponse, CertificateVerification
)
from app.db.models.certificate import Certificate
from app.db.models.enrollment import Enrollment
from app.db.models.course import Course
from app.db.models.user import User

router = APIRouter()


def generate_certificate_number() -> str:
    """Generate a unique certificate number."""
    return f"CERT-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"


def generate_verification_code() -> str:
    """Generate a verification code."""
    return secrets.token_hex(8).upper()


@router.post("/generate", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def generate_certificate(
    cert_data: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a certificate for a completed enrollment."""
    # Get enrollment
    enrollment_result = db.execute(
        select(Enrollment).where(Enrollment.id == cert_data.enrollment_id)
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Check if enrollment is completed
    if enrollment.status != 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enrollment must be completed to generate certificate"
        )
    
    # Check if certificate already exists
    existing_cert = db.execute(
        select(Certificate).where(Certificate.enrollment_id == cert_data.enrollment_id)
    ).scalar_one_or_none()
    
    if existing_cert and not existing_cert.is_revoked:
        return existing_cert
    
    # Get course details
    course_result = db.execute(
        select(Course).where(Course.id == enrollment.course_id)
    )
    course = course_result.scalar_one()
    
    # Create certificate
    certificate = Certificate(
        user_id=enrollment.user_id,
        course_id=enrollment.course_id,
        enrollment_id=enrollment.enrollment_id,
        certificate_number=generate_certificate_number(),
        verification_code=generate_verification_code(),
        title=f"Certificate of Completion - {course.title}",
        description=f"This certifies that the holder has successfully completed {course.title}"
    )
    
    db.add(certificate)
    enrollment.certificate_issued = True
    
    db.commit()
    db.refresh(certificate)
    return certificate


@router.post("/bulk-generate", status_code=status.HTTP_201_CREATED)
def bulk_generate_certificates(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate certificates for all completed enrollments in a course (admin/instructor only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to bulk generate certificates"
        )
    
    # Get all completed enrollments for the course
    enrollments_result = db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.status == 'completed',
                Enrollment.certificate_issued == False
            )
        )
    )
    enrollments = enrollments_result.scalars().all()
    
    # Get course
    course_result = db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    certificates_created = 0
    for enrollment in enrollments:
        certificate = Certificate(
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            enrollment_id=enrollment.id,
            certificate_number=generate_certificate_number(),
            verification_code=generate_verification_code(),
            title=f"Certificate of Completion - {course.title}",
            description=f"This certifies that the holder has successfully completed {course.title}"
        )
        db.add(certificate)
        enrollment.certificate_issued = True
        certificates_created += 1
    
    db.commit()
    
    return {
        "message": f"Generated {certificates_created} certificates",
        "course_id": course_id,
        "certificates_created": certificates_created
    }


@router.get("/", response_model=List[CertificateResponse])
def get_certificates(
    course_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get certificates with optional filters (admin only)."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all certificates"
        )
    
    query = select(Certificate)
    
    if course_id:
        query = query.where(Certificate.course_id == course_id)
    if user_id:
        query = query.where(Certificate.user_id == user_id)
    
    query = query.order_by(Certificate.issued_at.desc()).offset(skip).limit(limit)
    
    result = db.execute(query)
    certificates = result.scalars().all()
    return certificates


@router.get("/my-certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all certificates for current user."""
    result = db.execute(
        select(Certificate)
        .where(
            and_(
                Certificate.user_id == current_user.id,
                Certificate.is_revoked == False
            )
        )
        .order_by(Certificate.issued_at.desc())
    )
    certificates = result.scalars().all()
    return certificates


@router.get("/by-course/{course_id}", response_model=List[CertificateResponse])
def get_certificates_by_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all certificates for a course (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view course certificates"
        )
    
    result = db.execute(
        select(Certificate)
        .where(Certificate.course_id == course_id)
        .order_by(Certificate.issued_at.desc())
    )
    certificates = result.scalars().all()
    return certificates


@router.get("/{certificate_id}", response_model=CertificateResponse)
def get_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get certificate by ID."""
    result = db.execute(select(Certificate).where(Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Check authorization
    if certificate.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this certificate"
        )
    
    return certificate


@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download certificate as PDF."""
    result = db.execute(select(Certificate).where(Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Check authorization
    if certificate.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this certificate"
        )
    
    # In production, this would generate and return a PDF
    # For now, return certificate data
    return {
        "message": "Certificate download endpoint",
        "certificate_id": certificate_id,
        "certificate_number": certificate.certificate_number,
        "download_url": f"/api/v1/certificates/{certificate_id}/download.pdf"
    }


@router.get("/{certificate_id}/verify")
def verify_certificate(
    certificate_id: UUID,
    verification_code: str,
    db: Session = Depends(get_db)
):
    """Verify a certificate (public endpoint)."""
    result = db.execute(
        select(Certificate).where(
            and_(
                Certificate.id == certificate_id,
                Certificate.verification_code == verification_code
            )
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        return {
            "valid": False,
            "message": "Certificate not found or verification code is invalid"
        }
    
    if certificate.is_revoked:
        return {
            "valid": False,
            "message": "This certificate has been revoked"
        }
    
    # Get user and course details
    user_result = db.execute(select(User).where(User.id == certificate.user_id))
    user = user_result.scalar_one()
    
    course_result = db.execute(select(Course).where(Course.id == certificate.course_id))
    course = course_result.scalar_one()
    
    return {
        "valid": True,
        "certificate_number": certificate.certificate_number,
        "issued_to": f"{user.first_name} {user.last_name}" if user.first_name else user.username,
        "course_title": course.title,
        "issued_at": certificate.issued_at.isoformat(),
        "expires_at": certificate.expires_at.isoformat() if certificate.expires_at else None
    }


@router.post("/{certificate_id}/revoke", response_model=CertificateResponse)
def revoke_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Revoke a certificate (admin only)."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke certificates"
        )
    
    result = db.execute(select(Certificate).where(Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    certificate.is_revoked = True
    
    db.commit()
    db.refresh(certificate)
    return certificate


@router.get("/templates")
def get_certificate_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get available certificate templates (admin/instructor only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view templates"
        )
    
    # Return default templates
    # In production, this would fetch from database
    return {
        "templates": [
            {
                "id": "default",
                "name": "Default Certificate",
                "description": "Standard certificate template"
            },
            {
                "id": "professional",
                "name": "Professional Certificate",
                "description": "Professional-looking certificate with border"
            },
            {
                "id": "modern",
                "name": "Modern Certificate",
                "description": "Modern minimalist design"
            }
        ]
    }
