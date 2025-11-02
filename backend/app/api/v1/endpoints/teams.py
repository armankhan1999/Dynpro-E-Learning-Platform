from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/teams")
def create_team(
    name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    """Create a team."""
    return {
        "id": "team-1",
        "name": name,
        "description": description,
        "owner_id": str(current_user.id),
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/teams")
def get_teams(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all teams."""
    teams = [
        {
            "id": f"team-{i}",
            "name": f"Team {i}",
            "members_count": i * 5,
            "courses_assigned": i * 2
        }
        for i in range(1, 6)
    ]
    return {"teams": teams[skip:skip + limit], "total": len(teams)}


@router.get("/teams/{team_id}")
def get_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team details."""
    return {
        "id": str(team_id),
        "name": "Engineering Team",
        "description": "Software engineering team",
        "members_count": 25,
        "created_at": datetime.utcnow().isoformat()
    }


@router.put("/teams/{team_id}")
def update_team(
    team_id: UUID,
    name: Optional[str] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    """Update a team."""
    return {
        "id": str(team_id),
        "name": name,
        "description": description,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/teams/{team_id}")
def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    """Delete a team."""
    return {"message": "Team deleted successfully"}


@router.post("/teams/{team_id}/members")
def add_team_member(
    team_id: UUID,
    user_id: UUID,
    role: str = "member",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    """Add a member to a team."""
    return {
        "team_id": str(team_id),
        "user_id": str(user_id),
        "role": role,
        "added_at": datetime.utcnow().isoformat()
    }


@router.delete("/teams/{team_id}/members/{user_id}")
def remove_team_member(
    team_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    """Remove a member from a team."""
    return {"message": "Member removed from team"}


@router.get("/teams/{team_id}/members")
def get_team_members(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team members."""
    members = [
        {
            "user_id": f"user-{i}",
            "name": f"User {i}",
            "role": "member",
            "joined_at": datetime.utcnow().isoformat()
        }
        for i in range(1, 11)
    ]
    return {"members": members, "total": len(members)}
