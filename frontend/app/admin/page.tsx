'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import ContentLoader, { StatsCardSkeleton } from '@/components/ui/content-loader'
import { showToast } from '@/lib/toast'
import { BarChart3, Users, BookOpen, Award, TrendingUp, AlertCircle, Settings, Clock } from 'lucide-react'

interface RecentActivity {
  id: string
  action: string
  user_name: string
  entity_type: string
  created_at: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeCourses: 0,
    completionRate: 0,
    averageRating: 0,
    userGrowth: 0,
    enrollmentGrowth: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    await Promise.all([fetchStats(), fetchRecentActivity()])
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { analyticsApi } = await import('@/lib/api')
      const data = await analyticsApi.getPlatformAnalytics()
      setStats({
        totalUsers: data.total_users || 0,
        totalCourses: data.total_courses || 0,
        totalEnrollments: data.total_enrollments || 0,
        activeCourses: data.active_courses || 0,
        completionRate: data.completion_rate || 0,
        averageRating: data.average_rating || 0,
        userGrowth: data.user_growth_percentage || 0,
        enrollmentGrowth: data.enrollment_growth_percentage || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      showToast.error('Failed to load dashboard statistics', 'Please refresh the page to try again')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true)
      const { adminApi } = await import('@/lib/api')
      const data = await adminApi.getRecentActivity()
      setRecentActivity(data || [])
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
      showToast.error('Failed to load recent activity')
    } finally {
      setActivityLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return null
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Manage and monitor your e-learning platform</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-10 w-10 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalUsers}</span>
              </div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-xs text-blue-200 mt-1">
                {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth.toFixed(1)}% from last month
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-10 w-10 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalCourses}</span>
              </div>
              <p className="text-green-100 text-sm font-medium">Total Courses</p>
              <p className="text-xs text-green-200 mt-1">{stats.activeCourses} active</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-10 w-10 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalEnrollments}</span>
              </div>
              <p className="text-purple-100 text-sm font-medium">Total Enrollments</p>
              <p className="text-xs text-purple-200 mt-1">
                {stats.enrollmentGrowth > 0 ? '+' : ''}{stats.enrollmentGrowth.toFixed(1)}% from last month
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-10 w-10 opacity-80" />
                <span className="text-3xl font-bold">{stats.completionRate}%</span>
              </div>
              <p className="text-orange-100 text-sm font-medium">Completion Rate</p>
              <p className="text-xs text-orange-200 mt-1">Average across all courses</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Users</h3>
              <p className="text-gray-600 text-sm">View, edit, and manage user accounts</p>
            </div>
          </Link>

          <Link href="/admin/courses">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <BookOpen className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Courses</h3>
              <p className="text-gray-600 text-sm">Create, edit, and organize courses</p>
            </div>
          </Link>

          <Link href="/admin/reports">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">View Reports</h3>
              <p className="text-gray-600 text-sm">Analytics and performance reports</p>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <Settings className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600 text-sm">Platform configuration and preferences</p>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <BookOpen className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Categories</h3>
              <p className="text-gray-600 text-sm">Manage course categories and tags</p>
            </div>
          </Link>

          <Link href="/admin/announcements">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <AlertCircle className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Announcements</h3>
              <p className="text-gray-600 text-sm">Create and manage announcements</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-600" />
            Recent Activity
          </h2>
          {activityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors rounded px-2">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user_name}</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
