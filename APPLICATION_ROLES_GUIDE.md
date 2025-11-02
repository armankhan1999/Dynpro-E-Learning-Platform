# DynPro Learning Portal - Application Roles Guide

## All Available Roles

The application has **5 distinct roles** with different permissions and access levels:

---

## 1. 👨‍🎓 **Learner** (Default Role)
**Role Code:** `learner`

### Description:
The default role for all new users. Learners are students who enroll in courses and complete learning activities.

### Permissions:
- ✅ Browse and search courses
- ✅ Enroll in courses
- ✅ Access enrolled course content
- ✅ Take assessments and submit assignments
- ✅ View their own progress and certificates
- ✅ Participate in discussions
- ✅ View leaderboard
- ✅ Manage personal profile
- ✅ View achievements and badges
- ❌ Cannot create courses
- ❌ Cannot access admin panel
- ❌ Cannot manage other users

### Menu Access:
- Dashboard
- My Learning
- Browse Courses
- Certificates
- Achievements
- Discussions
- Calendar
- Leaderboard
- Profile Settings

---

## 2. 👨‍🏫 **Instructor**
**Role Code:** `instructor`

### Description:
Content creators and teachers who can create courses, manage content, and track student progress.

### Permissions:
- ✅ All Learner permissions
- ✅ Create and edit courses
- ✅ Create course modules and content
- ✅ Create assessments and assignments
- ✅ View enrolled students
- ✅ Grade assignments
- ✅ View course analytics and reports
- ✅ Manage course discussions
- ✅ Access Instructor Dashboard
- ✅ Limited access to admin features (Manage Courses)
- ❌ Cannot manage users
- ❌ Cannot access full admin panel

### Menu Access:
- All Learner menus +
- **Instructor Dashboard**
- **My Courses** (instructor view)
- **Content Management**
- **Assessments Management**
- **Students Management**
- **Reports** (instructor reports)
- **Admin → Manage Courses** (limited)

### Pages:
- `/instructor` - Instructor Dashboard
- `/instructor/courses` - Manage instructor's courses
- `/instructor/content` - Content management
- `/instructor/assessments` - Assessment management
- `/instructor/students` - Student tracking
- `/instructor/reports` - Course reports

---

## 3. 📊 **Manager**
**Role Code:** `manager`

### Description:
Middle-level administrators who can view reports and analytics but cannot modify system settings.

### Permissions:
- ✅ All Learner permissions
- ✅ View all reports and analytics
- ✅ View user progress across organization
- ✅ View course completion statistics
- ✅ Export reports
- ✅ Access to Reports section in admin panel
- ❌ Cannot create/edit courses
- ❌ Cannot manage users
- ❌ Cannot change system settings

### Menu Access:
- All Learner menus +
- **Admin → Reports** (read-only)

---

## 4. 🔧 **Admin**
**Role Code:** `admin`

### Description:
Full administrators who can manage the entire platform except super admin functions.

### Permissions:
- ✅ All Learner permissions
- ✅ All Instructor permissions
- ✅ All Manager permissions
- ✅ Manage all users (create, edit, deactivate)
- ✅ Manage all courses
- ✅ Manage categories and learning paths
- ✅ Manage certificates
- ✅ Manage announcements
- ✅ View audit logs
- ✅ Access all reports
- ✅ Configure system settings
- ✅ Full admin panel access
- ❌ Cannot delete super admins
- ❌ Limited system-level configurations

### Menu Access:
- All Learner menus +
- **Admin Dashboard**
- **Manage Users**
- **Manage Courses**
- **Reports**
- **Settings**
- **Audit Logs**
- **Announcements**
- **Categories**
- **Learning Paths**
- **Certificates**

### Pages:
- `/admin` - Admin Dashboard
- `/admin/users` - User management
- `/admin/courses` - Course management
- `/admin/reports` - System reports
- `/admin/settings` - System settings
- `/admin/audit-logs` - Audit logs
- `/admin/announcements` - Announcements
- `/admin/categories` - Category management
- `/admin/learning-paths` - Learning path management
- `/admin/certificates` - Certificate management

---

## 5. 👑 **Super Admin**
**Role Code:** `super_admin`

### Description:
Highest level administrator with unrestricted access to all platform features and configurations.

### Permissions:
- ✅ **ALL** permissions
- ✅ Everything Admin can do
- ✅ Manage other admins
- ✅ Delete any user (including admins)
- ✅ System-level configurations
- ✅ Database management access
- ✅ API key management
- ✅ Advanced security settings
- ✅ Backup and restore
- ✅ Full audit trail access

### Menu Access:
- **Everything** - All menus and features
- Additional super admin only features

---

## Role Hierarchy

```
Super Admin (Highest)
    ↓
  Admin
    ↓
 Manager
    ↓
Instructor
    ↓
 Learner (Lowest)
```

---

## Role Assignment

### During Registration:
Users can select their role from the registration form:
- **Learner** (default)
- **Instructor**
- **Admin**

**Note:** Super Admin role can only be assigned by existing Super Admins through the admin panel.

### Changing Roles:
- Admins and Super Admins can change user roles via:
  - `/admin/users` page
  - User management interface

---

## Role-Based Menu Visibility

### Sidebar Navigation Logic:
The sidebar (`modern-sidebar.tsx`) automatically shows/hides menu items based on user role:

```typescript
// Example from code:
{ name: 'Admin Dashboard', roles: ['admin', 'super_admin'] }
{ name: 'Manage Courses', roles: ['admin', 'super_admin', 'instructor'] }
{ name: 'Manage Users', roles: ['admin', 'super_admin'] }
{ name: 'Reports', roles: ['admin', 'super_admin', 'manager'] }
```

---

## Backend Role Definitions

**File:** `backend/app/db/models/user.py`

```python
class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    instructor = "instructor"
    learner = "learner"
    manager = "manager"
```

---

## Testing Different Roles

### To test each role:

1. **Register as Learner:**
   - Go to `/register`
   - Select "Learner" role
   - Complete registration

2. **Register as Instructor:**
   - Go to `/register`
   - Select "Instructor" role
   - Access `/instructor` dashboard

3. **Register as Admin:**
   - Go to `/register`
   - Select "Admin" role
   - Access `/admin` panel

4. **Create Super Admin:**
   - Must be done via database or by existing super admin
   - Or modify an existing admin user in database

---

## Summary Table

| Role | Code | Can Create Courses | Can Manage Users | Can View Reports | Admin Access |
|------|------|-------------------|------------------|------------------|--------------|
| **Learner** | `learner` | ❌ | ❌ | ❌ | ❌ |
| **Instructor** | `instructor` | ✅ | ❌ | ✅ (own courses) | Partial |
| **Manager** | `manager` | ❌ | ❌ | ✅ (all) | Partial |
| **Admin** | `admin` | ✅ | ✅ | ✅ | Full |
| **Super Admin** | `super_admin` | ✅ | ✅ | ✅ | Full + System |

---

## Current Implementation Status

✅ **Backend:** All 5 roles defined in database model  
✅ **Frontend:** Role-based menu visibility implemented  
✅ **Registration:** Role selection available (learner, instructor, admin)  
✅ **Sidebar:** Dynamic menu based on user role  
✅ **Pages:** Separate dashboards for learner, instructor, and admin  

---

## Recommendations

1. **For Development/Testing:**
   - Create one user for each role
   - Test navigation and permissions
   - Verify menu visibility

2. **For Production:**
   - Limit admin role assignment
   - Super admin should be restricted
   - Use manager role for reporting needs
   - Default to learner for new registrations

3. **Security:**
   - Implement backend role checks on all API endpoints
   - Don't rely only on frontend role hiding
   - Add role verification middleware
