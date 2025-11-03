from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, func, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.schemas.discussion import (
    DiscussionCreate, DiscussionUpdate, DiscussionResponse, DiscussionWithReplies,
    ReplyCreate, ReplyUpdate, ReplyResponse
)
from app.db.models.discussion import Discussion, DiscussionReply, DiscussionUpvote
from app.db.models.user import User

router = APIRouter()


@router.post("/", response_model=DiscussionResponse, status_code=status.HTTP_201_CREATED)
def create_discussion(
    discussion_in: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new discussion."""
    discussion = Discussion(
        user_id=current_user.id,
        **discussion_in.dict()
    )
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    return discussion


@router.get("/", response_model=List[DiscussionResponse])
def get_discussions(
    course_id: Optional[UUID] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all discussions with optional filters."""
    query = select(Discussion).options(joinedload(Discussion.user))

    if course_id:
        query = query.where(Discussion.course_id == course_id)
    if category:
        query = query.where(Discussion.category == category)
    if search:
        query = query.where(
            or_(
                Discussion.title.ilike(f"%{search}%"),
                Discussion.content.ilike(f"%{search}%")
            )
        )

    # Order by pinned first, then by creation date
    query = query.order_by(
        Discussion.is_pinned.desc(),
        Discussion.created_at.desc()
    ).offset(skip).limit(limit)

    result = db.execute(query)
    discussions = result.scalars().all()
    return discussions


@router.get("/by-course/{course_id}", response_model=List[DiscussionResponse])
def get_discussions_by_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all discussions for a specific course."""
    result = db.execute(
        select(Discussion).where(Discussion.course_id == course_id)
        .order_by(Discussion.is_pinned.desc(), Discussion.created_at.desc())
    )
    discussions = result.scalars().all()
    return discussions


@router.get("/my-discussions", response_model=List[DiscussionResponse])
def get_my_discussions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all discussions created by current user."""
    result = db.execute(
        select(Discussion)
        .options(joinedload(Discussion.user))
        .where(Discussion.user_id == current_user.id)
        .order_by(Discussion.created_at.desc())
    )
    discussions = result.scalars().all()
    return discussions


@router.get("/trending", response_model=List[DiscussionResponse])
def get_trending_discussions(
    days: int = Query(default=7, ge=1, le=30),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get trending discussions based on recent activity."""
    since_date = datetime.utcnow() - timedelta(days=days)

    result = db.execute(
        select(Discussion)
        .options(joinedload(Discussion.user))
        .where(Discussion.created_at >= since_date)
        .order_by(
            (Discussion.upvotes_count + Discussion.replies_count).desc()
        )
        .limit(limit)
    )
    discussions = result.scalars().all()
    return discussions


@router.get("/search", response_model=List[DiscussionResponse])
def search_discussions(
    q: str = Query(..., min_length=2),
    course_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search discussions by title or content."""
    query = select(Discussion).where(
        or_(
            Discussion.title.ilike(f"%{q}%"),
            Discussion.content.ilike(f"%{q}%")
        )
    )
    
    if course_id:
        query = query.where(Discussion.course_id == course_id)
    
    query = query.order_by(Discussion.created_at.desc())
    
    result = db.execute(query)
    discussions = result.scalars().all()
    return discussions


@router.get("/{discussion_id}", response_model=DiscussionWithReplies)
def get_discussion(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get discussion with replies."""
    result = db.execute(
        select(Discussion)
        .options(joinedload(Discussion.user))
        .where(Discussion.id == discussion_id)
    )
    discussion = result.scalar_one_or_none()

    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )

    # Get replies with user information
    replies_result = db.execute(
        select(DiscussionReply)
        .options(joinedload(DiscussionReply.user))
        .where(DiscussionReply.discussion_id == discussion_id)
        .order_by(DiscussionReply.is_solution.desc(), DiscussionReply.created_at.asc())
    )
    replies = replies_result.scalars().all()

    discussion_dict = DiscussionResponse.from_orm(discussion).dict()
    discussion_dict['replies'] = [ReplyResponse.from_orm(r) for r in replies]

    return discussion_dict


@router.put("/{discussion_id}", response_model=DiscussionResponse)
def update_discussion(
    discussion_id: UUID,
    discussion_update: DiscussionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a discussion."""
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Check ownership
    if discussion.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this discussion"
        )
    
    update_data = discussion_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(discussion, field, value)
    
    discussion.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(discussion)
    return discussion


@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discussion(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a discussion."""
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Check ownership or admin
    if discussion.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this discussion"
        )
    
    db.delete(discussion)
    db.commit()


@router.post("/{discussion_id}/pin", response_model=DiscussionResponse)
def pin_discussion(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Pin a discussion (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pin discussions"
        )
    
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    discussion.is_pinned = not discussion.is_pinned
    discussion.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(discussion)
    return discussion


@router.post("/{discussion_id}/lock", response_model=DiscussionResponse)
def lock_discussion(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lock a discussion (instructor/admin only)."""
    if current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to lock discussions"
        )
    
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    discussion.is_locked = not discussion.is_locked
    discussion.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(discussion)
    return discussion


@router.post("/{discussion_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def follow_discussion(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Follow a discussion for notifications."""
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Add follow logic here (could be a separate table)
    # For now, just return success
    return


# Reply endpoints
@router.post("/{discussion_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(
    discussion_id: UUID,
    reply_in: ReplyCreate,
    parent_reply_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a reply to a discussion."""
    # Check if discussion exists and is not locked
    result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    if discussion.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discussion is locked"
        )
    
    reply = DiscussionReply(
        discussion_id=discussion_id,
        user_id=current_user.id,
        parent_reply_id=parent_reply_id,
        **reply_in.dict()
    )
    db.add(reply)
    
    # Update reply count
    discussion.replies_count += 1
    
    db.commit()
    db.refresh(reply)
    return reply


@router.get("/{discussion_id}/replies", response_model=List[ReplyResponse])
def get_replies(
    discussion_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all replies for a discussion."""
    result = db.execute(
        select(DiscussionReply)
        .where(DiscussionReply.discussion_id == discussion_id)
        .order_by(DiscussionReply.is_solution.desc(), DiscussionReply.created_at.asc())
    )
    replies = result.scalars().all()
    return replies


@router.put("/{discussion_id}/replies/{reply_id}", response_model=ReplyResponse)
def update_reply(
    discussion_id: UUID,
    reply_id: UUID,
    reply_update: ReplyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a reply."""
    result = db.execute(
        select(DiscussionReply).where(
            and_(
                DiscussionReply.id == reply_id,
                DiscussionReply.discussion_id == discussion_id
            )
        )
    )
    reply = result.scalar_one_or_none()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check ownership
    if reply.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this reply"
        )
    
    update_data = reply_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reply, field, value)
    
    reply.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reply)
    return reply


@router.delete("/{discussion_id}/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    discussion_id: UUID,
    reply_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a reply."""
    result = db.execute(
        select(DiscussionReply).where(
            and_(
                DiscussionReply.id == reply_id,
                DiscussionReply.discussion_id == discussion_id
            )
        )
    )
    reply = result.scalar_one_or_none()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check ownership or admin
    if reply.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reply"
        )
    
    # Get discussion and update count
    discussion_result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = discussion_result.scalar_one()
    discussion.replies_count = max(0, discussion.replies_count - 1)
    
    db.delete(reply)
    db.commit()


@router.post("/{discussion_id}/replies/{reply_id}/upvote", status_code=status.HTTP_204_NO_CONTENT)
def upvote_reply(
    discussion_id: UUID,
    reply_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upvote a reply."""
    # Check if reply exists
    result = db.execute(
        select(DiscussionReply).where(
            and_(
                DiscussionReply.id == reply_id,
                DiscussionReply.discussion_id == discussion_id
            )
        )
    )
    reply = result.scalar_one_or_none()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check if already upvoted
    existing_upvote = db.execute(
        select(DiscussionUpvote).where(
            and_(
                DiscussionUpvote.reply_id == reply_id,
                DiscussionUpvote.user_id == current_user.id
            )
        )
    ).scalar_one_or_none()
    
    if existing_upvote:
        # Remove upvote
        db.delete(existing_upvote)
        reply.upvotes_count = max(0, reply.upvotes_count - 1)
    else:
        # Add upvote
        upvote = DiscussionUpvote(
            reply_id=reply_id,
            user_id=current_user.id
        )
        db.add(upvote)
        reply.upvotes_count += 1
    
    db.commit()


@router.post("/{discussion_id}/mark-solution", response_model=DiscussionResponse)
def mark_solution(
    discussion_id: UUID,
    reply_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a reply as the solution (discussion owner or instructor/admin)."""
    # Get discussion
    discussion_result = db.execute(select(Discussion).where(Discussion.id == discussion_id))
    discussion = discussion_result.scalar_one_or_none()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Check authorization
    if discussion.user_id != current_user.id and current_user.role not in ['instructor', 'admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark solution"
        )
    
    # Get reply
    reply_result = db.execute(
        select(DiscussionReply).where(
            and_(
                DiscussionReply.id == reply_id,
                DiscussionReply.discussion_id == discussion_id
            )
        )
    )
    reply = reply_result.scalar_one_or_none()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Unmark all other solutions
    db.execute(
        select(DiscussionReply)
        .where(DiscussionReply.discussion_id == discussion_id)
    )
    all_replies = db.execute(
        select(DiscussionReply).where(DiscussionReply.discussion_id == discussion_id)
    ).scalars().all()
    
    for r in all_replies:
        r.is_solution = False
    
    # Mark this reply as solution
    reply.is_solution = True
    discussion.is_resolved = True
    
    db.commit()
    db.refresh(discussion)
    return discussion
