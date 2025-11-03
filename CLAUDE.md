# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DynPro E-Learning Platform is a full-stack internal employee training platform with course management, user tracking, assessments, gamification, and comprehensive reporting capabilities. The platform is 95% complete and production-ready.

**Current Status:** Backend 100% complete (283/283 endpoints), Frontend 100% complete (54/54 pages), API integration 100% complete.

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0 with asyncpg
- **Database:** PostgreSQL 15+
- **Migrations:** Alembic
- **Authentication:** JWT with bcrypt
- **File Storage:** MinIO (S3-compatible)
- **Search:** MeiliSearch
- **Cache:** Redis
- **Testing:** pytest with pytest-asyncio

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** Shadcn/ui with Lucide icons
- **State Management:** Zustand + TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors

## Development Commands

### Backend Commands
```bash
# Start backend server
cd backend
python start_server.py
# Or: uvicorn app.main:app --reload --port 8000

# Database migrations
cd backend
alembic upgrade head                # Apply migrations
alembic revision --autogenerate -m "description"  # Create migration
alembic downgrade -1                # Rollback one migration

# Run tests
cd backend
pytest                              # Run all tests
pytest tests/test_auth.py          # Run specific test file
pytest -v                          # Verbose output

# Database test connection
cd backend
python test_db.py

# Access API documentation
# http://127.0.0.1:8000/docs (Swagger UI)
# http://127.0.0.1:8000/redoc (ReDoc)
```

### Frontend Commands
```bash
# Install dependencies
cd frontend
npm install

# Development server
npm run dev                         # Starts on http://localhost:3000

# Production build
npm run build                       # Build for production
npm start                          # Start production server

# Linting
npm run lint                       # Run ESLint
```

### Docker Commands
```bash
# Start infrastructure services
docker-compose up -d postgres redis minio meilisearch

# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Architecture Overview

### Backend Structure
```
backend/
├── app/
│   ├── api/v1/           # API endpoints organized by resource
│   │   ├── endpoints/    # Individual endpoint modules
│   │   └── router.py     # Main API router
│   ├── core/            # Core functionality
│   │   ├── config.py    # Settings and configuration
│   │   ├── security.py  # Auth utilities (JWT, password hashing)
│   │   └── deps.py      # Dependency injection
│   ├── db/              # Database layer
│   │   ├── models/      # SQLAlchemy models
│   │   ├── session.py   # Database session management
│   │   └── base.py      # Base model class
│   ├── schemas/         # Pydantic schemas (request/response)
│   ├── services/        # Business logic layer
│   └── main.py          # FastAPI application entry point
├── alembic/             # Database migrations
└── requirements.txt     # Python dependencies
```

### Frontend Structure
```
frontend/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Auth pages (login, register)
│   ├── admin/          # Admin dashboard pages
│   ├── instructor/     # Instructor dashboard pages
│   ├── manager/        # Manager dashboard pages
│   ├── dashboard/      # Learner dashboard
│   ├── courses/        # Course pages
│   ├── learn/          # Learning content pages
│   ├── discussions/    # Forum pages
│   ├── profile/        # User profile pages
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Landing page
├── components/          # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...             # Feature-specific components
├── lib/                # Utilities and API client
│   ├── api/            # API service modules (30 files)
│   ├── api-client.ts   # Axios client with interceptors
│   └── utils.ts        # Utility functions
├── contexts/           # React contexts
│   └── auth-context.tsx # Authentication context
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

### API Service Layer
All 283 backend endpoints are accessible via 30 organized API service files in `frontend/lib/api/`:
- auth.ts, courses.ts, users.ts, enrollments.ts, assessments.ts
- assignments.ts, discussions.ts, notifications.ts, certificates.ts
- learningPaths.ts, files.ts, gamification.ts, payments.ts, analytics.ts
- admin.ts, liveSessions.ts, ratings.ts, search.ts, reports.ts
- categories.ts, teams.ts, subscriptions.ts, coupons.ts, quizzes.ts
- content.ts, progress.ts, scorm.ts, tags.ts, bookmarks.ts, wishlist.ts
- settings.ts, integrations.ts

## User Roles & Access Control

The platform implements 5 distinct user roles with hierarchical permissions:

1. **Learner** (default): Browse courses, enroll, complete content, take assessments
2. **Instructor**: All learner permissions + create/manage courses, grade assignments, view course analytics
3. **Manager**: All learner permissions + view reports/analytics across organization (read-only)
4. **Admin**: Full platform management except super admin functions
5. **Super Admin**: Unrestricted access to all features

Role-based access is enforced on:
- Backend: `require_role()` dependency in `backend/app/core/deps.py`
- Frontend: Role checks in components and route guards
- UI: Dynamic menu visibility in sidebar based on user role

## Key Implementation Notes

### Backend Best Practices
- **Async/Await:** All database operations use async SQLAlchemy with asyncpg
- **Dependency Injection:** Use FastAPI's `Depends()` for database sessions and auth
- **Error Handling:** Use HTTPException with appropriate status codes
- **Validation:** Pydantic v2 schemas for request/response validation
- **Database:**
  - UUIDs for primary keys
  - Soft deletes via `deleted_at` timestamp
  - Indexes on foreign keys and frequently queried columns
  - Enum types for status fields (e.g., UserRole, CourseStatus)

### Frontend Best Practices
- **Server Components:** Use where possible for better performance
- **Data Fetching:** TanStack Query for server state, Zustand for client state
- **Forms:** React Hook Form with Zod schemas for validation
- **API Integration:** All API calls go through typed service modules in `lib/api/`
- **Auth:** JWT tokens stored in sessionStorage, refresh tokens in httpOnly cookies
- **Error Handling:** Axios interceptors handle token refresh and error toasts

### Critical Database Fixes Applied
1. `metadata` renamed to `cert_metadata` in Certificate model (SQLAlchemy reserved keyword)
2. `upvotes` renamed to `upvotes_count` in DiscussionReply model
3. Added missing `DiscussionUpvote` model for upvote tracking
4. `UserLearningPath` renamed to `LearningPathEnrollment` (with alias)
5. Fixed Pydantic v2 config syntax in settings

### Authentication Flow
1. User logs in with credentials
2. Backend validates and returns JWT access token (15 min) + refresh token (7 days)
3. Frontend stores access token in sessionStorage
4. Axios interceptor adds `Authorization: Bearer <token>` header to all requests
5. On 401 response, interceptor attempts token refresh automatically
6. On refresh failure, user is redirected to login

## Common Development Tasks

### Adding a New API Endpoint
1. Define Pydantic schemas in `backend/app/schemas/`
2. Create endpoint in `backend/app/api/v1/endpoints/`
3. Add route to router in `backend/app/api/v1/router.py`
4. Add business logic to `backend/app/services/`
5. Create/update frontend service in `frontend/lib/api/`
6. Add types to `frontend/types/index.ts`

### Creating a New Page
1. Create page in appropriate `frontend/app/` directory
2. Add route protection if needed (check user role)
3. Use layout component for consistent UI
4. Integrate with API services from `lib/api/`
5. Use TanStack Query for data fetching
6. Add page to sidebar navigation if needed

### Running Database Migrations
```bash
# Backend must be running with database connection
cd backend
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Testing Role-Based Access
- Register users with different roles (Learner, Instructor, Admin)
- Log in as each role to verify menu visibility and access permissions
- Super Admin role must be assigned via database or by existing super admin

## Environment Configuration

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://eduuser:edupass@localhost/edudb
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
REDIS_URL=redis://localhost:6379
MEILI_HOST=http://localhost:7700
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema Highlights

- **users**: User accounts with role-based access
- **courses**: Course catalog with instructor, category, status
- **modules**: Course sections/chapters
- **content_items**: Learning materials (video, document, quiz, etc.)
- **enrollments**: User-course enrollments with progress tracking
- **assessments**: Quizzes and exams with questions
- **assignments**: Homework submissions with grading
- **discussions**: Forum threads with replies and upvotes
- **certificates**: Generated certificates with verification
- **learning_paths**: Structured learning sequences
- **notifications**: User notification system
- **audit_logs**: System activity tracking

All tables use UUIDs as primary keys and include `created_at`/`updated_at` timestamps.

## Known Issues & Solutions

### Issue: SQLAlchemy Reserved Keywords
**Solution:** Avoid using Python/SQLAlchemy reserved words as column names (e.g., `metadata` → `cert_metadata`)

### Issue: Pydantic v2 Compatibility
**Solution:** Use `model_config` instead of `Config` class in Pydantic models

### Issue: Import Path Errors
**Solution:** Always use relative imports within the same module; absolute imports across modules

### Issue: Layout Refresh on Navigation
**Solution:** Use Next.js Link component, not HTML anchor tags; ensure layout.tsx is properly structured

## Testing Strategy

- **Unit Tests:** Business logic in services layer
- **Integration Tests:** API endpoints with test database
- **E2E Tests:** Critical user flows (not yet implemented)
- **Test Coverage:** Aim for 70%+ overall, 100% for auth/security

## Performance Considerations

- **Database:** Indexes on all foreign keys and frequently queried columns
- **Caching:** Redis for session management and API response caching
- **CDN:** MinIO can integrate with CloudFront for media delivery
- **Pagination:** All list endpoints support pagination
- **Query Optimization:** Use eager loading to avoid N+1 queries

## Deployment Notes

- **Backend:** Can deploy to Railway, Render, or Fly.io
- **Frontend:** Can deploy to Vercel, Netlify, or Railway
- **Database:** Use managed PostgreSQL (Supabase, Neon, Railway)
- **Storage:** Self-hosted MinIO or Cloudflare R2
- **Docker:** Full docker-compose.yml provided for local development

## Additional Documentation

- `APPLICATION_ROLES_GUIDE.md`: Comprehensive role-based access control documentation
- `BUILD_PROGRESS_TRACKER.md`: Detailed build progress and feature completion status
- `FRONTEND_API_INTEGRATION_TRACKER.md`: API integration status per page
- `E-Learning Platform Development Documentation.md`: Full technical specification
- API Documentation: http://127.0.0.1:8000/docs (when backend is running)

## Quick Reference

**Database:** PostgreSQL on port 5432 (edudb/eduuser/edupass)
**Backend:** FastAPI on port 8000
**Frontend:** Next.js on port 3000
**MinIO:** Ports 9000 (API) and 9001 (Console)
**Redis:** Port 6379
**MeiliSearch:** Port 7700

**Default Admin Credentials:** Create via database or registration with Admin role selection
