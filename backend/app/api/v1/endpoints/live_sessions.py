from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.deps import get_current_active_user, require_role
from app.db.models.user import User

router = APIRouter()


@router.post("/live-sessions")
def create_live_session(
    title: str,
    description: str,
    course_id: UUID,
    scheduled_at: datetime,
    duration_minutes: int,
    meeting_url: str = None,
    max_attendees: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Create a new live session."""
    return {
        "id": "session-1",
        "title": title,
        "description": description,
        "course_id": str(course_id),
        "instructor_id": str(current_user.id),
        "instructor_name": f"{current_user.first_name} {current_user.last_name}",
        "scheduled_at": scheduled_at.isoformat(),
        "duration_minutes": duration_minutes,
        "meeting_url": meeting_url or "https://meet.example.com/session-1",
        "max_attendees": max_attendees,
        "status": "scheduled",
        "attendees_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/live-sessions")
def get_live_sessions(
    course_id: Optional[UUID] = None,
    status: Optional[str] = None,
    upcoming: bool = False,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get live sessions."""
    # Mock data
    sessions = [
        {
            "id": f"session-{i}",
            "title": f"Live Q&A Session {i}",
            "description": "Interactive session with the instructor",
            "course_id": str(course_id) if course_id else f"course-{i}",
            "course_title": f"Course {i}",
            "instructor_id": f"instructor-{i}",
            "instructor_name": "John Doe",
            "scheduled_at": (datetime.utcnow() + timedelta(days=i)).isoformat(),
            "duration_minutes": 60,
            "meeting_url": f"https://meet.example.com/session-{i}",
            "status": "scheduled" if i > 0 else "live",
            "attendees_count": 25,
            "max_attendees": 100
        }
        for i in range(1, 6)
    ]
    
    return {
        "sessions": sessions[skip:skip + limit],
        "total": len(sessions)
    }


@router.get("/live-sessions/{session_id}")
def get_live_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific live session."""
    return {
        "id": str(session_id),
        "title": "Live Q&A Session",
        "description": "Interactive session with the instructor",
        "course_id": "course-1",
        "course_title": "Introduction to Python",
        "instructor_id": "instructor-1",
        "instructor_name": "John Doe",
        "scheduled_at": datetime.utcnow().isoformat(),
        "duration_minutes": 60,
        "meeting_url": "https://meet.example.com/session-1",
        "status": "scheduled",
        "attendees_count": 25,
        "max_attendees": 100,
        "recording_url": None,
        "materials": []
    }


@router.put("/live-sessions/{session_id}")
def update_live_session(
    session_id: UUID,
    title: str = None,
    description: str = None,
    scheduled_at: datetime = None,
    duration_minutes: int = None,
    meeting_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Update a live session."""
    return {
        "id": str(session_id),
        "title": title,
        "description": description,
        "scheduled_at": scheduled_at.isoformat() if scheduled_at else None,
        "duration_minutes": duration_minutes,
        "meeting_url": meeting_url,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.delete("/live-sessions/{session_id}")
def delete_live_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Delete a live session."""
    return {"message": "Live session deleted successfully"}


@router.post("/live-sessions/{session_id}/attend")
def register_for_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Register to attend a live session."""
    return {
        "session_id": str(session_id),
        "user_id": str(current_user.id),
        "registered_at": datetime.utcnow().isoformat(),
        "status": "registered",
        "message": "Successfully registered for the session"
    }


@router.get("/live-sessions/{session_id}/attendees")
def get_session_attendees(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Get list of attendees for a session."""
    attendees = [
        {
            "user_id": f"user-{i}",
            "username": f"user{i}",
            "full_name": f"User {i}",
            "email": f"user{i}@example.com",
            "registered_at": datetime.utcnow().isoformat(),
            "attended": i % 2 == 0,
            "attendance_duration": 45 if i % 2 == 0 else None
        }
        for i in range(1, 11)
    ]
    
    return {
        "session_id": str(session_id),
        "attendees": attendees,
        "total_registered": len(attendees),
        "total_attended": len([a for a in attendees if a["attended"]])
    }


@router.post("/live-sessions/{session_id}/recording")
def upload_session_recording(
    session_id: UUID,
    recording_url: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["instructor", "admin"]))
):
    """Upload recording URL for a completed session."""
    return {
        "session_id": str(session_id),
        "recording_url": recording_url,
        "uploaded_at": datetime.utcnow().isoformat(),
        "message": "Recording uploaded successfully"
    }


# Calendar endpoints
@router.get("/calendar/events")
def get_calendar_events(
    start_date: datetime,
    end_date: datetime,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get calendar events for a date range."""
    events = [
        {
            "id": f"event-{i}",
            "title": f"Live Session {i}",
            "type": "live_session",
            "start_time": (start_date + timedelta(days=i)).isoformat(),
            "end_time": (start_date + timedelta(days=i, hours=1)).isoformat(),
            "course_id": f"course-{i}",
            "course_title": f"Course {i}",
            "location": "Online",
            "meeting_url": f"https://meet.example.com/session-{i}"
        }
        for i in range(1, 6)
    ]
    
    return {
        "events": events,
        "total": len(events)
    }


@router.post("/calendar/sync")
def sync_calendar(
    calendar_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Sync with external calendar (Google, Outlook, etc.)."""
    return {
        "calendar_type": calendar_type,
        "sync_status": "success",
        "events_synced": 5,
        "last_sync": datetime.utcnow().isoformat()
    }
