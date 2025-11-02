from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, courses, enrollments, categories, 
    assessments, assignments, discussions, notifications,
    certificates, learning_paths, files, search, admin, reports, gamification,
    ratings, live_sessions, scorm, analytics, progress, content, quiz, tags,
    bookmarks, wishlist, teams, announcements, settings,
    integrations
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(learning_paths.router, prefix="/learning-paths", tags=["learning-paths"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
api_router.include_router(live_sessions.router, prefix="/live", tags=["live-sessions"])
api_router.include_router(scorm.router, prefix="", tags=["scorm"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(content.router, prefix="", tags=["content"])
api_router.include_router(quiz.router, prefix="", tags=["quizzes"])
api_router.include_router(tags.router, prefix="", tags=["tags"])
api_router.include_router(bookmarks.router, prefix="", tags=["bookmarks"])
api_router.include_router(wishlist.router, prefix="", tags=["wishlist"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
