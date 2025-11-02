# E-Learning Platform Development Documentation

## 📁 Document 1: .claude.md (Master Instructions for Claude Code)

```markdown
# E-Learning Platform - Project Instructions

## Project Overview
Build a complete internal e-learning platform with course management, user tracking, assessments, and reporting capabilities.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM, Alembic migrations
- **Database**: PostgreSQL 15+
- **Authentication**: JWT with refresh tokens, bcrypt
- **File Storage**: MinIO (S3-compatible, self-hosted)
- **Video Processing**: FFmpeg
- **Search**: MeiliSearch (open-source alternative to Algolia)
- **Cache**: Redis (optional, can use in-memory initially)
- **Email**: Nodemailer (frontend) / FastAPI-Mail (backend)
- **Real-time**: Socket.io
- **Testing**: Jest (frontend), Pytest (backend)

## Project Structure
```

eduplatform/ ├── frontend/               # Next.js application │   ├── app/               # App router pages │   ├── components/        # React components │   ├── lib/              # Utilities and helpers │   ├── hooks/            # Custom React hooks │   ├── services/         # API service layer │   ├── store/            # Zustand state management │   ├── types/            # TypeScript types │   └── public/           # Static assets ├── backend/               # FastAPI application │   ├── app/ │   │   ├── api/          # API endpoints │   │   ├── core/         # Core functionality │   │   ├── db/           # Database models │   │   ├── schemas/      # Pydantic schemas │   │   ├── services/     # Business logic │   │   ├── utils/        # Utilities │   │   └── main.py       # Application entry │   ├── alembic/          # Database migrations │   └── tests/            # Test files ├── docker/               # Docker configurations ├── docs/                 # Documentation └── scripts/              # Utility scripts

```
## Development Phases

### Phase 1: Foundation (Week 1-2)
1. Set up project structure
2. Configure PostgreSQL database
3. Implement authentication system
4. Create user management
5. Set up file upload with MinIO

### Phase 2: Core Learning (Week 3-4)
1. Course CRUD operations
2. Content management system
3. Video upload and streaming
4. Course enrollment system
5. Progress tracking

### Phase 3: Assessment & Interaction (Week 5-6)
1. Quiz and assessment system
2. Assignment submissions
3. Discussion forums
4. Notifications system
5. Basic reporting

### Phase 4: Advanced Features (Week 7-8)
1. Learning paths
2. Certificates generation
3. Advanced analytics
4. Search functionality
5. Mobile optimization

## Key Implementation Guidelines

### Frontend Development
- Use Server Components where possible for better performance
- Implement proper loading states and error boundaries
- Use React Query/SWR for data fetching
- Implement responsive design mobile-first
- Use Suspense for code splitting

### Backend Development
- Follow RESTful API design principles
- Implement proper pagination for all list endpoints
- Use dependency injection for services
- Implement comprehensive error handling
- Add request validation using Pydantic

### Database Design
- Use UUID for primary keys
- Implement soft deletes where appropriate
- Add proper indexes for query optimization
- Use database transactions for critical operations
- Implement audit logging

### Security Requirements
- Implement rate limiting on all endpoints
- Use CORS properly
- Sanitize all user inputs
- Implement SQL injection prevention
- Use environment variables for secrets
- Implement RBAC (Role-Based Access Control)

## API Endpoint Structure
```

/api/v1/ ├── /auth │   ├── POST /register │   ├── POST /login │   ├── POST /refresh │   └── POST /logout ├── /users │   ├── GET / │   ├── GET /{id} │   ├── PUT /{id} │   └── DELETE /{id} ├── /courses │   ├── GET / │   ├── POST / │   ├── GET /{id} │   ├── PUT /{id} │   ├── DELETE /{id} │   └── POST /{id}/enroll ├── /content │   ├── POST /upload │   ├── GET /{id} │   └── DELETE /{id} ├── /assessments │   ├── GET / │   ├── POST / │   ├── POST /submit │   └── GET /results └── /reports ├── GET /progress ├── GET /analytics └── GET /certificates

```
## Testing Strategy
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 70% code coverage
- Performance testing for concurrent users

## Performance Requirements
- Page load time < 3 seconds
- API response time < 500ms
- Support 1000+ concurrent users
- Video streaming optimization
- Implement caching strategies

## Deployment Configuration
- Use Docker for containerization
- Environment-based configuration
- GitHub Actions for CI/CD
- Database backup strategy
- Monitoring and logging setup
```

## 📁 Document 2: System Architecture

~~~markdown
# System Architecture Document

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Web App]
        MOB[Mobile Browser]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx Reverse Proxy]
    end
    
    subgraph "Application Layer"
        API[FastAPI Backend]
        SOCKET[Socket.io Server]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
        MINIO[MinIO Storage]
        SEARCH[MeiliSearch]
    end
    
    WEB --> NGINX
    MOB --> NGINX
    NGINX --> API
    NGINX --> SOCKET
    API --> PG
    API --> REDIS
    API --> MINIO
    API --> SEARCH
    SOCKET --> REDIS
~~~

## Component Details

### Frontend (Next.js)

- **Version**: 14.x with App Router
- **Rendering**: Hybrid (SSR + CSR)
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **WebSocket**: Socket.io-client

### Backend (FastAPI)

- **Version**: 0.100+
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Task Queue**: Celery + Redis
- **Validation**: Pydantic v2
- **CORS**: FastAPI middleware

### Database (PostgreSQL)

- **Version**: 15+
- **Extensions**: UUID-OSSP, pg_trgm
- **Backup**: pg_dump with cron
- **Connection Pool**: asyncpg
- **Query Optimization**: Proper indexing

### File Storage (MinIO)

- **Protocol**: S3-compatible
- **Buckets**:
  - course-videos
  - course-materials
  - user-uploads
  - certificates
- **CDN**: CloudFront (optional)

### Search Engine (MeiliSearch)

- **Indexes**:
  - courses
  - users
  - content
- **Features**: Typo tolerance, facets, filters

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Backend validates against PostgreSQL
3. Generate JWT access token (15 min)
4. Generate refresh token (7 days)
5. Store refresh token in httpOnly cookie
6. Return access token to frontend
7. Frontend stores in memory (not localStorage)
```

### Authorization Model

```
RBAC with the following roles:
- SUPER_ADMIN: Full system access
- ADMIN: Manage courses and users
- INSTRUCTOR: Create and manage own courses
- LEARNER: Access enrolled courses
- MANAGER: View team reports
```

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers
- Load balancer (Nginx)
- Read replicas for PostgreSQL
- Redis cluster for caching
- MinIO cluster for storage

### Caching Strategy

- Redis for session management
- API response caching (5 min)
- Static asset caching (1 hour)
- Database query caching
- CDN for media files

## Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (optional)
- **APM**: OpenTelemetry
- **Uptime**: UptimeRobot
- **Error Tracking**: Sentry (free tier)

```
## 📁 Document 3: Database Schema

```sql
-- Database Schema: eduplat_db

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'instructor', 'learner', 'manager');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'dropped');
CREATE TYPE content_type AS ENUM ('video', 'document', 'quiz', 'assignment', 'link');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'learner',
    department VARCHAR(100),
    job_title VARCHAR(100),
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    thumbnail_url VARCHAR(500),
    instructor_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    status course_status DEFAULT 'draft',
    duration_hours INTEGER,
    difficulty_level VARCHAR(20),
    prerequisites TEXT[],
    learning_objectives TEXT[],
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    enrollment_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Course modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course content table
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    content_url VARCHAR(500),
    content_data JSONB,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    status enrollment_status DEFAULT 'enrolled',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT false,
    UNIQUE(user_id, course_id)
);

-- Progress tracking table
CREATE TABLE content_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    content_item_id UUID REFERENCES content_items(id),
    is_completed BOOLEAN DEFAULT false,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    last_position INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, content_item_id)
);

-- Assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    module_id UUID REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    pass_percentage DECIMAL(5,2) DEFAULT 60,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER,
    shuffle_questions BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB,
    correct_answer JSONB,
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment attempts table
CREATE TABLE assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id),
    user_id UUID REFERENCES users(id),
    attempt_number INTEGER NOT NULL,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT false,
    answers JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_seconds INTEGER
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    module_id UUID REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    max_score DECIMAL(5,2) DEFAULT 100,
    due_date TIMESTAMP,
    allow_late_submission BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignment submissions table
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id),
    user_id UUID REFERENCES users(id),
    submission_text TEXT,
    attachment_urls TEXT[],
    score DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP,
    UNIQUE(assignment_id, user_id)
);

-- Discussion forums table
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    module_id UUID REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Discussion replies table
CREATE TABLE discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id),
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    enrollment_id UUID REFERENCES enrollments(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    certificate_url VARCHAR(500),
    metadata JSONB,
    UNIQUE(user_id, course_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Learning paths table
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    is_mandatory BOOLEAN DEFAULT false,
    target_roles TEXT[],
    target_departments UUID[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning path courses table
CREATE TABLE learning_path_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    order_index INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    UNIQUE(learning_path_id, course_id)
);

-- User learning paths table
CREATE TABLE user_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    learning_path_id UUID REFERENCES learning_paths(id),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, learning_path_id)
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_content_progress_enrollment ON content_progress(enrollment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Full text search indexes
CREATE INDEX idx_courses_search ON courses USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📁 Document 4: API Specification

```yaml
# api-specification.yaml
openapi: 3.0.0
info:
  title: E-Learning Platform API
  version: 1.0.0
  description: Internal e-learning platform REST API

servers:
  - url: http://localhost:8000/api/v1
  - url: https://api.eduplat.company.com/api/v1

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        username:
          type: string
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [super_admin, admin, instructor, learner, manager]
        department:
          type: string
        created_at:
          type: string
          format: date-time
          
    Course:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        slug:
          type: string
        description:
          type: string
        instructor_id:
          type: string
          format: uuid
        category_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [draft, published, archived]
        duration_hours:
          type: integer
        created_at:
          type: string
          format: date-time
          
    Enrollment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        course_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [enrolled, in_progress, completed, dropped]
        progress_percentage:
          type: number
        enrolled_at:
          type: string
          format: date-time

paths:
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - username
                - password
              properties:
                email:
                  type: string
                username:
                  type: string
                password:
                  type: string
                first_name:
                  type: string
                last_name:
                  type: string
      responses:
        201:
          description: User created successfully
        400:
          description: Invalid input
        409:
          description: User already exists
          
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
                    
  /courses:
    get:
      summary: List all courses
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: category
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, published, archived]
      responses:
        200:
          description: List of courses
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Course'
                  total:
                    type: integer
                  page:
                    type: integer
                  limit:
                    type: integer
                    
    post:
      summary: Create new course
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - description
              properties:
                title:
                  type: string
                description:
                  type: string
                category_id:
                  type: string
                  format: uuid
      responses:
        201:
          description: Course created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
                
  /courses/{id}:
    get:
      summary: Get course details
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Course details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
        404:
          description: Course not found
          
  /courses/{id}/enroll:
    post:
      summary: Enroll in course
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        201:
          description: Enrollment successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Enrollment'
        400:
          description: Already enrolled
        404:
          description: Course not found
```

## 📁 Document 5: Backend Implementation Guide

```python
# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base_class import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Learning Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/edudb"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # MeiliSearch
    MEILI_HOST: str = "http://localhost:7700"
    MEILI_MASTER_KEY: str = "masterKey"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
# backend/app/db/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import uuid
from datetime import datetime
import enum

class UserRole(enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    instructor = "instructor"
    learner = "learner"
    manager = "manager"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.learner)
    department = Column(String(100))
    job_title = Column(String(100))
    profile_image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime)
# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.auth import UserCreate, Token, UserResponse
from app.services.user import UserService
from datetime import timedelta
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    
    # Check if user exists
    if await user_service.get_by_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    user = await user_service.create(user_in)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    user = await user_service.authenticate(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_access_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }
```

## 📁 Document 6: Frontend Implementation Guide

```typescript
// frontend/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Learning Platform',
  description: 'Internal employee training platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
// frontend/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
// frontend/lib/api-client.ts
import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from '@/components/ui/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

class ApiClient {
  private client: AxiosInstance
  private refreshToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshAccessToken()
            return this.client(originalRequest)
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('access_token')
    }
    return null
  }

  private async refreshAccessToken() {
    const response = await this.client.post('/auth/refresh', {
      refresh_token: this.refreshToken,
    })
    
    const { access_token } = response.data
    sessionStorage.setItem('access_token', access_token)
    return access_token
  }

  private clearTokens() {
    sessionStorage.removeItem('access_token')
    this.refreshToken = null
  }

  private handleError(error: AxiosError) {
    const message = (error.response?.data as any)?.detail || 'An error occurred'
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  // API methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      username: email,
      password,
    })
    
    const { access_token, refresh_token, user } = response.data
    sessionStorage.setItem('access_token', access_token)
    this.refreshToken = refresh_token
    
    return { user, access_token }
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data)
    return response.data
  }

  async getCourses(params?: any) {
    const response = await this.client.get('/courses', { params })
    return response.data
  }

  async getCourse(id: string) {
    const response = await this.client.get(`/courses/${id}`)
    return response.data
  }

  async enrollCourse(id: string) {
    const response = await this.client.post(`/courses/${id}/enroll`)
    return response.data
  }

  async uploadFile(file: File, type: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await this.client.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }
}

export const apiClient = new ApiClient()
// frontend/components/course/course-card.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, BookOpen } from 'lucide-react'
import { Course } from '@/types'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={course.thumbnail_url || '/placeholder-course.jpg'}
              alt={course.title}
              fill
              className="object-cover rounded-t-lg"
            />
            <Badge className="absolute top-2 right-2">
              {course.category?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {course.short_description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.modules_count} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.enrollments_count}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Image
                src={course.instructor?.profile_image_url || '/avatar.png'}
                alt={course.instructor?.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm">{course.instructor?.name}</span>
            </div>
            <Badge variant="secondary">
              {course.difficulty_level}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

## 📁 Document 7: Deployment Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: eduuser
      POSTGRES_PASSWORD: edupass
      POSTGRES_DB: edudb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - edunet

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - edunet

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - edunet

  meilisearch:
    image: getmeili/meilisearch:latest
    environment:
      MEILI_MASTER_KEY: masterKey
      MEILI_ENV: development
    volumes:
      - meili_data:/meili_data
    ports:
      - "7700:7700"
    networks:
      - edunet

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://eduuser:edupass@postgres/edudb
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
      MEILI_HOST: http://meilisearch:7700
    depends_on:
      - postgres
      - redis
      - minio
      - meilisearch
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    networks:
      - edunet

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    networks:
      - edunet

networks:
  edunet:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
  meili_data:
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build

# Start server
CMD ["npm", "run", "dev"]
```

## 📁 Document 8: Testing Strategy

```python
# backend/tests/test_auth.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_register_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_login_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # First register
        await client.post(
            f"{settings.API_V1_STR}/auth/register",
            json={
                "email": "login@example.com",
                "username": "loginuser",
                "password": "Test123!"
            }
        )
        
        # Then login
        response = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            data={
                "username": "login@example.com",
                "password": "Test123!"
            }
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
// frontend/__tests__/course-card.test.tsx
import { render, screen } from '@testing-library/react'
import { CourseCard } from '@/components/course/course-card'

const mockCourse = {
  id: '1',
  title: 'Test Course',
  short_description: 'This is a test course',
  thumbnail_url: '/test.jpg',
  duration_hours: 10,
  modules_count: 5,
  enrollments_count: 100,
  difficulty_level: 'Beginner',
  category: { name: 'Technology' },
  instructor: { name: 'John Doe' }
}

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('This is a test course')).toBeInTheDocument()
    expect(screen.getByText('10h')).toBeInTheDocument()
    expect(screen.getByText('5 modules')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
  })
})
```

## 📁 Document 9: Environment Configuration

```bash
# .env.example (backend)
# Application
PROJECT_NAME="E-Learning Platform"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="your-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL="postgresql+asyncpg://eduuser:edupass@localhost/edudb"

# CORS
BACKEND_CORS_ORIGINS='["http://localhost:3000","https://yourdomain.com"]'

# MinIO
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_SECURE=false

# Redis
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAILS_FROM_EMAIL="noreply@eduplatform.com"
EMAILS_FROM_NAME="E-Learning Platform"

# MeiliSearch
MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="masterKey"

# Sentry (optional)
SENTRY_DSN=""

# OpenTelemetry (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=""
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

## 📁 Document 10: Coding Standards

~~~markdown
# Coding Standards and Best Practices

## General Principles
1. **DRY (Don't Repeat Yourself)**: Avoid code duplication
2. **KISS (Keep It Simple, Stupid)**: Prefer simple solutions
3. **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until needed
4. **SOLID Principles**: Follow SOLID design principles

## Python (Backend) Standards

### Code Style
- Follow PEP 8
- Use type hints for all functions
- Maximum line length: 88 characters (Black formatter)
- Use meaningful variable names

### File Organization
```python
# Correct order of imports
import standard_library_modules
import third_party_modules
import local_application_modules

# Class and function definitions
class MyClass:
    """Docstring describing the class."""
    
    def __init__(self):
        """Initialize the class."""
        pass
    
    def method(self, param: str) -> str:
        """
        Method description.
        
        Args:
            param: Parameter description
            
        Returns:
            Return value description
        """
        return param
~~~

### Async/Await Pattern

```python
async def get_user(user_id: UUID, db: AsyncSession) -> User:
    """Get user by ID."""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()
```

### Error Handling

```python
try:
    result = await risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise HTTPException(
        status_code=400,
        detail="Operation failed"
    )
```

## TypeScript (Frontend) Standards

### Code Style

- Use TypeScript strict mode
- Prefer const over let
- Use arrow functions for callbacks
- Use template literals for string concatenation

### Component Structure

```typescript
// Use functional components with TypeScript
interface Props {
  title: string
  onClose: () => void
}

export const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  // Hooks at the top
  const [state, setState] = useState<string>('')
  
  // Effects after hooks
  useEffect(() => {
    // Effect logic
  }, [])
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [])
  
  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### Custom Hooks

```typescript
// Custom hooks in separate files
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Auth logic
  }, [])
  
  return { user, loading }
}
```

## Database Standards

### Naming Conventions

- Tables: plural, snake_case (e.g., `users`, `course_modules`)
- Columns: snake_case (e.g., `created_at`, `user_id`)
- Indexes: idx_table_column (e.g., `idx_users_email`)
- Foreign keys: fk_table_reference (e.g., `fk_enrollments_user`)

### Query Optimization

- Always use indexes for foreign keys
- Use EXPLAIN ANALYZE for complex queries
- Avoid N+1 queries
- Use eager loading when appropriate

## API Standards

### RESTful Endpoints

```
GET    /api/v1/resources      # List
GET    /api/v1/resources/:id  # Get one
POST   /api/v1/resources      # Create
PUT    /api/v1/resources/:id  # Update
DELETE /api/v1/resources/:id  # Delete
```

### Response Format

```json
{
  "data": {},
  "message": "Success",
  "errors": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "detail": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Git Workflow

### Branch Naming

- feature/feature-name
- bugfix/bug-description
- hotfix/critical-fix
- release/version-number

### Commit Messages

```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

### Example

```
feat(auth): add OAuth2 integration

- Implemented Google OAuth2
- Added Facebook login
- Updated user model

Closes #123
```

## Testing Standards

### Test File Naming

- Python: test_*.py or *_test.py
- TypeScript: *.test.ts or *.spec.ts

### Test Structure (AAA Pattern)

```python
def test_user_creation():
    # Arrange
    user_data = {"email": "test@example.com"}
    
    # Act
    user = create_user(user_data)
    
    # Assert
    assert user.email == "test@example.com"
```

### Coverage Requirements

- Minimum 70% overall coverage
- 80% for critical paths
- 100% for authentication/authorization

## Security Standards

### Authentication

- Use JWT with short expiration
- Implement refresh token rotation
- Store sensitive tokens in httpOnly cookies

### Input Validation

- Validate all inputs on both frontend and backend
- Use parameterized queries
- Sanitize HTML content
- Implement rate limiting

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS in production
- Implement CSRF protection
- Follow OWASP Top 10 guidelines

```
## 📁 Document 11: Quick Start Guide

```markdown
# Quick Start Guide

## Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose
- Git

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourcompany/eduplatform.git
cd eduplatform
```

### 2. Start Infrastructure Services

```bash
docker-compose up -d postgres redis minio meilisearch
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_data.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- MeiliSearch: http://localhost:7700

## Create First Admin User

```bash
cd backend
python scripts/create_admin.py --email admin@company.com --password SecurePass123!
```

## Development Workflow

### Adding New Feature

1. Create feature branch
2. Implement backend API
3. Add tests
4. Implement frontend
5. Test integration
6. Submit PR

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Backend
docker build -f backend/Dockerfile -t eduplatform-backend .

# Frontend
cd frontend
npm run build
```

## Common Issues

### Database Connection Error

- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check network connectivity

### MinIO Connection Error

- Ensure MinIO is running
- Check MINIO_ENDPOINT configuration
- Verify access keys

### Port Already in Use

```bash
# Find process using port
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process or change port in configuration
```

## Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Component Storybook](http://localhost:6006/)
- [Database Diagram](https://claude.ai/chat/docs/database-diagram.png)

```
---

## Summary

This comprehensive documentation suite provides everything needed to build the e-learning platform using Claude Code:

1. **Master .claude.md file** - Complete project instructions and structure
2. **System Architecture** - Technical design and component overview  
3. **Database Schema** - Complete PostgreSQL schema with all tables
4. **API Specification** - OpenAPI/Swagger documentation
5. **Backend Implementation** - FastAPI code structure and examples
6. **Frontend Implementation** - Next.js components and services
7. **Deployment Configuration** - Docker setup and configurations
8. **Testing Strategy** - Test examples and coverage requirements
9. **Environment Configuration** - All required environment variables
10. **Coding Standards** - Consistent code style guidelines
11. **Quick Start Guide** - Step-by-step setup instructions

### Tech Stack Summary (All Open Source):
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15
- **File Storage**: MinIO (S3-compatible)
- **Search**: MeiliSearch
- **Cache**: Redis
- **Real-time**: Socket.io
- **Video Processing**: FFmpeg
- **Monitoring**: Prometheus + Grafana (optional)

### Deployment Options:
- **Frontend**: Vercel, Netlify, Railway
- **Backend**: Railway, Render, Fly.io
- **Database**: Supabase, Neon, Railway PostgreSQL
- **Storage**: Self-hosted MinIO or Cloudflare R2

This documentation provides a production-ready foundation that Claude Code can use to systematically build your e-learning platform with all necessary features while using only open-source technologies.
```