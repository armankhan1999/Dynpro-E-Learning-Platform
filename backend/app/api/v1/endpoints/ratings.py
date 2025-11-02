from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from typing import List
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()


# Course Ratings
@router.post("/courses/{course_id}/ratings")
def create_course_rating(
    course_id: UUID,
    rating: int,
    review: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update a course rating."""
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if user already rated this course
    # In production, check database and update or create
    
    return {
        "id": "rating-1",
        "course_id": str(course_id),
        "user_id": str(current_user.id),
        "rating": rating,
        "review": review,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


@router.get("/courses/{course_id}/ratings")
def get_course_ratings(
    course_id: UUID,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all ratings for a course."""
    # Mock data
    ratings = [
        {
            "id": f"rating-{i}",
            "course_id": str(course_id),
            "user_id": f"user-{i}",
            "username": f"user{i}",
            "rating": 4 + (i % 2),
            "review": f"Great course! Very informative." if i % 2 == 0 else None,
            "created_at": datetime.utcnow().isoformat(),
            "helpful_count": i * 2
        }
        for i in range(1, 6)
    ]
    
    return {
        "ratings": ratings[skip:skip + limit],
        "total": len(ratings),
        "average_rating": 4.5,
        "rating_distribution": {
            "5": 45,
            "4": 30,
            "3": 15,
            "2": 5,
            "1": 5
        }
    }


@router.put("/courses/{course_id}/ratings/{rating_id}")
def update_course_rating(
    course_id: UUID,
    rating_id: UUID,
    rating: int,
    review: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a course rating."""
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    return {
        "id": str(rating_id),
        "course_id": str(course_id),
        "user_id": str(current_user.id),
        "rating": rating,
        "review": review,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/courses/{course_id}/ratings/{rating_id}")
def delete_course_rating(
    course_id: UUID,
    rating_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a course rating."""
    return {"message": "Rating deleted successfully"}


# Course Reviews (detailed text reviews)
@router.post("/courses/{course_id}/reviews")
def create_course_review(
    course_id: UUID,
    title: str,
    content: str,
    rating: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a detailed course review."""
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    return {
        "id": "review-1",
        "course_id": str(course_id),
        "user_id": str(current_user.id),
        "username": current_user.username,
        "title": title,
        "content": content,
        "rating": rating,
        "helpful_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/courses/{course_id}/reviews")
def get_course_reviews(
    course_id: UUID,
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "recent",
    db: Session = Depends(get_db)
):
    """Get all reviews for a course."""
    # Mock data
    reviews = [
        {
            "id": f"review-{i}",
            "course_id": str(course_id),
            "user_id": f"user-{i}",
            "username": f"user{i}",
            "user_avatar": None,
            "title": "Excellent Course!",
            "content": "This course exceeded my expectations. The instructor explains concepts clearly and provides practical examples.",
            "rating": 5,
            "helpful_count": 15,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 6)
    ]
    
    return {
        "reviews": reviews[skip:skip + limit],
        "total": len(reviews),
        "average_rating": 4.5
    }


@router.put("/courses/{course_id}/reviews/{review_id}")
def update_course_review(
    course_id: UUID,
    review_id: UUID,
    title: str = None,
    content: str = None,
    rating: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a course review."""
    if rating and (rating < 1 or rating > 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    return {
        "id": str(review_id),
        "course_id": str(course_id),
        "title": title,
        "content": content,
        "rating": rating,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/courses/{course_id}/reviews/{review_id}")
def delete_course_review(
    course_id: UUID,
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a course review."""
    return {"message": "Review deleted successfully"}


# Mark review as helpful
@router.post("/reviews/{review_id}/helpful")
def mark_review_helpful(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a review as helpful."""
    return {
        "review_id": str(review_id),
        "helpful_count": 16,
        "message": "Review marked as helpful"
    }
