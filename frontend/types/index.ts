export interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  role: 'super_admin' | 'admin' | 'instructor' | 'learner' | 'manager'
  department?: string
  job_title?: string
  profile_image_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  thumbnail_url?: string
  instructor_id?: string
  category_id?: string
  status: 'draft' | 'published' | 'archived'
  duration_hours?: number
  difficulty_level?: string
  prerequisites?: string[]
  learning_objectives?: string[]
  tags?: string[]
  is_featured: boolean
  enrollment_limit?: number
  created_at: string
  updated_at: string
  instructor?: User
  category?: Category
  modules_count?: number
  enrollments_count?: number
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  module_id: string
  title: string
  description?: string
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'link'
  content_url?: string
  content_data?: any
  duration_minutes?: number
  order_index: number
  is_mandatory: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped'
  progress_percentage: number
  enrolled_at: string
  started_at?: string
  completed_at?: string
  last_accessed_at?: string
  certificate_issued: boolean
  course?: Course
}

export interface ContentProgress {
  id: string
  enrollment_id: string
  content_item_id: string
  is_completed: boolean
  progress_percentage: number
  time_spent_seconds: number
  last_position?: number
  started_at: string
  completed_at?: string
}
