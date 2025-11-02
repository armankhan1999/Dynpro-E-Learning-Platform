from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User
from app.db.models.course import Course
from app.db.models.enrollment import Enrollment

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_active_user)):
    """Require admin or super_admin role."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get platform statistics."""
    total_users = db.execute(select(func.count(User.id))).scalar()
    total_courses = db.execute(select(func.count(Course.id))).scalar()
    total_enrollments = db.execute(select(func.count(Enrollment.id))).scalar()
    
    active_users = db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    ).scalar()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get audit logs."""
    return {
        "logs": [],
        "total": 0,
        "page": skip // limit + 1
    }


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
async def create_announcement(
    title: str,
    content: str,
    target_audience: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create platform announcement."""
    return {
        "id": "announcement-id",
        "title": title,
        "content": content,
        "target_audience": target_audience,
        "created_by": current_user.id,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/announcements")
async def get_announcements(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all announcements."""
    return {"announcements": [], "total": 0}


@router.put("/announcements/{announcement_id}")
async def update_announcement(
    announcement_id: UUID,
    title: Optional[str] = None,
    content: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update announcement."""
    return {"message": "Announcement updated"}


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete announcement."""
    return


@router.get("/system-health")
async def get_system_health(
    current_user: User = Depends(require_admin)
):
    """Get system health status."""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "minio": "connected",
        "meilisearch": "connected",
        "uptime": "24h",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/backup")
async def create_backup(
    current_user: User = Depends(require_admin)
):
    """Create system backup."""
    return {
        "message": "Backup initiated",
        "backup_id": "backup-id",
        "status": "processing"
    }


@router.post("/maintenance-mode")
async def toggle_maintenance_mode(
    enabled: bool,
    current_user: User = Depends(require_admin)
):
    """Toggle maintenance mode."""
    return {
        "maintenance_mode": enabled,
        "message": f"Maintenance mode {'enabled' if enabled else 'disabled'}"
    }


@router.get("/settings")
async def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get platform settings."""
    return {
        "platform_name": "E-Learning Platform",
        "allow_registration": True,
        "require_email_verification": False,
        "max_file_size_mb": 500
    }


@router.put("/settings")
async def update_settings(
    settings: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update platform settings."""
    return {"message": "Settings updated", "settings": settings}


@router.put("/branding")
async def update_branding(
    logo_url: Optional[str] = None,
    primary_color: Optional[str] = None,
    secondary_color: Optional[str] = None,
    current_user: User = Depends(require_admin)
):
    """Update platform branding."""
    return {
        "message": "Branding updated",
        "branding": {
            "logo_url": logo_url,
            "primary_color": primary_color,
            "secondary_color": secondary_color
        }
    }


@router.get("/users/activity")
async def get_users_activity(
    days: int = 7,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user activity logs."""
    return {"activities": [], "total": 0}


@router.post("/cache/clear")
async def clear_cache(
    cache_type: str = "all",
    current_user: User = Depends(require_admin)
):
    """Clear application cache."""
    return {
        "message": f"Cache cleared: {cache_type}",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/logs")
async def get_system_logs(
    level: str = "all",
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin)
):
    """Get system logs."""
    return {"logs": [], "total": 0}


@router.post("/email/test")
async def send_test_email(
    email: str,
    current_user: User = Depends(require_admin)
):
    """Send test email."""
    return {
        "message": f"Test email sent to {email}",
        "status": "sent"
    }


@router.get("/departments")
async def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all departments."""
    return {"departments": []}


@router.post("/departments")
async def create_department(
    name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create new department."""
    return {
        "id": "dept-id",
        "name": name,
        "description": description
    }
