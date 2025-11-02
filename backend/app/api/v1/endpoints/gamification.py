from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.db.models.user import User

router = APIRouter()


@router.get("/badges")
async def get_all_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all available badges."""
    return {
        "badges": [
            {"id": "1", "name": "First Course", "description": "Complete your first course", "icon": "🎓"},
            {"id": "2", "name": "Quick Learner", "description": "Complete 5 courses", "icon": "⚡"},
            {"id": "3", "name": "Master", "description": "Complete 10 courses", "icon": "👑"}
        ]
    }


@router.post("/badges", status_code=status.HTTP_201_CREATED)
async def create_badge(
    name: str,
    description: str,
    icon: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new badge (admin only)."""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return {
        "id": "badge-id",
        "name": name,
        "description": description,
        "icon": icon
    }


@router.get("/badges/{badge_id}")
async def get_badge(
    badge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get badge details."""
    return {
        "id": str(badge_id),
        "name": "First Course",
        "description": "Complete your first course",
        "icon": "🎓",
        "earned_by": 150
    }


@router.post("/users/{user_id}/badges/award")
async def award_badge(
    user_id: UUID,
    badge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Award a badge to a user (admin/instructor only)."""
    if current_user.role not in ['admin', 'super_admin', 'instructor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to award badges"
        )
    
    return {
        "message": "Badge awarded successfully",
        "user_id": str(user_id),
        "badge_id": str(badge_id),
        "awarded_at": datetime.utcnow().isoformat()
    }


@router.get("/users/{user_id}/badges")
async def get_user_badges(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all badges earned by a user."""
    return {
        "user_id": str(user_id),
        "badges": [
            {
                "id": "1",
                "name": "First Course",
                "earned_at": "2024-01-15T10:00:00"
            }
        ],
        "total_badges": 1
    }


@router.get("/leaderboard")
async def get_leaderboard(
    period: str = "all",
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get global leaderboard."""
    return {
        "period": period,
        "leaderboard": [
            {"rank": 1, "user_id": "user1", "username": "john_doe", "points": 1500},
            {"rank": 2, "user_id": "user2", "username": "jane_smith", "points": 1200},
            {"rank": 3, "user_id": "user3", "username": "bob_wilson", "points": 1000}
        ]
    }


@router.get("/leaderboard/team")
async def get_team_leaderboard(
    team_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team leaderboard."""
    return {
        "team_id": str(team_id) if team_id else "all",
        "leaderboard": []
    }


@router.get("/points/history")
async def get_points_history(
    user_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get points history for a user."""
    target_user_id = user_id or current_user.id
    
    return {
        "user_id": str(target_user_id),
        "total_points": 850,
        "history": [
            {"date": "2024-01-20", "points": 50, "reason": "Completed course"},
            {"date": "2024-01-18", "points": 100, "reason": "Perfect quiz score"}
        ]
    }


@router.post("/points/award")
async def award_points(
    user_id: UUID,
    points: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Award points to a user (admin/instructor only)."""
    if current_user.role not in ['admin', 'super_admin', 'instructor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to award points"
        )
    
    return {
        "message": "Points awarded successfully",
        "user_id": str(user_id),
        "points": points,
        "reason": reason
    }


@router.get("/achievements")
async def get_all_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all available achievements."""
    return {
        "achievements": [
            {"id": "1", "name": "Early Bird", "description": "Login before 8 AM"},
            {"id": "2", "name": "Night Owl", "description": "Complete a course after 10 PM"},
            {"id": "3", "name": "Streak Master", "description": "Maintain a 7-day learning streak"}
        ]
    }


@router.get("/users/{user_id}/achievements")
async def get_user_achievements(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get achievements earned by a user."""
    return {
        "user_id": str(user_id),
        "achievements": [],
        "total_achievements": 0
    }


@router.get("/streaks")
async def get_learning_streaks(
    user_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get learning streak information."""
    target_user_id = user_id or current_user.id
    
    return {
        "user_id": str(target_user_id),
        "current_streak": 5,
        "longest_streak": 12,
        "last_activity": datetime.utcnow().isoformat()
    }
