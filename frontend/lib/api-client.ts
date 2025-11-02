import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'sonner'

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
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', access_token)
    }
    return access_token
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token')
    }
    this.refreshToken = null
  }

  private handleError(error: AxiosError) {
    const message = (error.response?.data as any)?.detail || 'An error occurred'
    toast.error(message)
  }

  // Auth methods
  async login(email: string, password: string) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await this.client.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    const { access_token, refresh_token, user } = response.data
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', access_token)
    }
    this.refreshToken = refresh_token
    
    return { user, access_token }
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data)
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  // Course methods
  async getCourses(params?: any) {
    const response = await this.client.get('/courses', { params })
    return response.data
  }

  async getCourse(id: string) {
    const response = await this.client.get(`/courses/${id}`)
    return response.data
  }

  async createCourse(data: any) {
    const response = await this.client.post('/courses', data)
    return response.data
  }

  async updateCourse(id: string, data: any) {
    const response = await this.client.put(`/courses/${id}`, data)
    return response.data
  }

  async getCourseModules(courseId: string) {
    const response = await this.client.get(`/courses/${courseId}/modules`)
    return response.data
  }

  async getModuleContent(moduleId: string) {
    const response = await this.client.get(`/courses/modules/${moduleId}/content`)
    return response.data
  }

  // Enrollment methods
  async enrollCourse(courseId: string) {
    const response = await this.client.post('/enrollments', { course_id: courseId })
    return response.data
  }

  async getMyEnrollments() {
    const response = await this.client.get('/enrollments/my-courses')
    return response.data
  }

  async getEnrollment(id: string) {
    const response = await this.client.get(`/enrollments/${id}`)
    return response.data
  }

  async updateProgress(enrollmentId: string, data: any) {
    const response = await this.client.post(`/enrollments/${enrollmentId}/progress`, data)
    return response.data
  }

  async getEnrollmentProgress(enrollmentId: string) {
    const response = await this.client.get(`/enrollments/${enrollmentId}/progress`)
    return response.data
  }

  // Category methods
  async getCategories() {
    const response = await this.client.get('/categories')
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
