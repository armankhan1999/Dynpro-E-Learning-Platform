from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User
from app.db.models.course import Course, ContentItem, Module

router = APIRouter()


@router.get("/")
async def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by type: courses, users, content"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Global search across all entities."""
    results = {
        "query": q,
        "courses": [],
        "users": [],
        "content": [],
        "total": 0
    }
    
    # Search courses
    if not type or type == "courses":
        courses_result = db.execute(
            select(Course).where(
                or_(
                    Course.title.ilike(f"%{q}%"),
                    Course.description.ilike(f"%{q}%"),
                    Course.short_description.ilike(f"%{q}%")
                )
            ).limit(limit)
        )
        courses = courses_result.scalars().all()
        results["courses"] = [
            {
                "id": str(c.id),
                "title": c.title,
                "description": c.short_description,
                "type": "course"
            } for c in courses
        ]
    
    # Search users (admin only)
    if current_user.role in ['admin', 'super_admin']:
        if not type or type == "users":
            users_result = db.execute(
                select(User).where(
                    or_(
                        User.username.ilike(f"%{q}%"),
                        User.email.ilike(f"%{q}%"),
                        User.first_name.ilike(f"%{q}%"),
                        User.last_name.ilike(f"%{q}%")
                    )
                ).limit(limit)
            )
            users = users_result.scalars().all()
            results["users"] = [
                {
                    "id": str(u.id),
                    "username": u.username,
                    "email": u.email,
                    "name": f"{u.first_name} {u.last_name}" if u.first_name else u.username,
                    "type": "user"
                } for u in users
            ]
    
    results["total"] = len(results["courses"]) + len(results["users"]) + len(results["content"])
    
    return results


@router.get("/courses")
async def search_courses(
    q: str = Query(..., min_length=2),
    category_id: Optional[UUID] = None,
    difficulty_level: Optional[str] = None,
    min_duration: Optional[int] = None,
    max_duration: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search courses with advanced filters."""
    query = select(Course).where(
        or_(
            Course.title.ilike(f"%{q}%"),
            Course.description.ilike(f"%{q}%"),
            Course.short_description.ilike(f"%{q}%")
        )
    )
    
    if category_id:
        query = query.where(Course.category_id == category_id)
    
    if difficulty_level:
        query = query.where(Course.difficulty_level == difficulty_level)
    
    if min_duration:
        query = query.where(Course.duration_hours >= min_duration)
    
    if max_duration:
        query = query.where(Course.duration_hours <= max_duration)
    
    query = query.where(Course.status == 'published')
    query = query.offset(skip).limit(limit)
    
    result = db.execute(query)
    courses = result.scalars().all()
    
    return {
        "query": q,
        "results": [
            {
                "id": str(c.id),
                "title": c.title,
                "description": c.short_description,
                "difficulty_level": c.difficulty_level,
                "duration_hours": c.duration_hours,
                "enrollments_count": c.enrollments_count,
                "is_featured": c.is_featured
            } for c in courses
        ],
        "total": len(courses),
        "page": skip // limit + 1
    }


@router.get("/users")
async def search_users(
    q: str = Query(..., min_length=2),
    role: Optional[str] = None,
    department: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search users (admin/instructor only)."""
    if current_user.role not in ['admin', 'super_admin', 'instructor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to search users"
        )
    
    query = select(User).where(
        or_(
            User.username.ilike(f"%{q}%"),
            User.email.ilike(f"%{q}%"),
            User.first_name.ilike(f"%{q}%"),
            User.last_name.ilike(f"%{q}%")
        )
    )
    
    if role:
        query = query.where(User.role == role)
    
    if department:
        query = query.where(User.department == department)
    
    query = query.offset(skip).limit(limit)
    
    result = db.execute(query)
    users = result.scalars().all()
    
    return {
        "query": q,
        "results": [
            {
                "id": str(u.id),
                "username": u.username,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}" if u.first_name else u.username,
                "role": u.role,
                "department": u.department
            } for u in users
        ],
        "total": len(users),
        "page": skip // limit + 1
    }


@router.get("/content")
async def search_content(
    q: str = Query(..., min_length=2),
    course_id: Optional[UUID] = None,
    content_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search course content."""
    query = select(ContentItem).where(
        or_(
            ContentItem.title.ilike(f"%{q}%"),
            ContentItem.description.ilike(f"%{q}%")
        )
    )
    
    if course_id:
        query = query.where(ContentItem.module_id.in_(
            select(Module.id).where(Module.course_id == course_id)
        ))
    
    if content_type:
        query = query.where(ContentItem.content_type == content_type)
    
    query = query.offset(skip).limit(limit)
    
    result = db.execute(query)
    contents = result.scalars().all()
    
    return {
        "query": q,
        "results": [
            {
                "id": str(c.id),
                "title": c.title,
                "description": c.description,
                "content_type": c.content_type,
                "course_id": str(c.course_id) if c.course_id else None
            } for c in contents
        ],
        "total": len(contents),
        "page": skip // limit + 1
    }


@router.post("/index")
async def reindex_search(
    entity_type: str = Query(..., description="Entity type to reindex: courses, users, content, all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reindex search data (admin only)."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reindex search"
        )
    
    # In production: Trigger MeiliSearch reindexing
    return {
        "message": f"Reindexing {entity_type} started",
        "status": "processing"
    }


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get search suggestions/autocomplete."""
    # In production: Use MeiliSearch for fast autocomplete
    suggestions = []
    
    # Get course title suggestions
    courses_result = db.execute(
        select(Course.title).where(
            Course.title.ilike(f"{q}%")
        ).limit(limit)
    )
    courses = courses_result.scalars().all()
    suggestions.extend([{"text": title, "type": "course"} for title in courses])
    
    return {
        "query": q,
        "suggestions": suggestions[:limit]
    }
