'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { BookOpen, Users, CheckCircle, Clock } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { StatsCardSkeleton } from '@/components/ui/content-loader'

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    completionRate: 0,
    pendingReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { analyticsApi } = await import('@/lib/api')
      const data = await analyticsApi.getCourseAnalytics()
      setStats({
        courses: data.total_courses || 0,
        students: data.total_students || 0,
        completionRate: data.completion_rate || 0,
        pendingReviews: data.pending_reviews || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      showToast.error('Failed to load instructor dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Instructor Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <BookOpen className="h-10 w-10 mb-4 opacity-80" />
              <p className="text-3xl font-bold mb-2">{stats.courses}</p>
              <p className="text-blue-100 text-sm">My Courses</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <Users className="h-10 w-10 mb-4 opacity-80" />
              <p className="text-3xl font-bold mb-2">{stats.students}</p>
              <p className="text-green-100 text-sm">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <CheckCircle className="h-10 w-10 mb-4 opacity-80" />
              <p className="text-3xl font-bold mb-2">{stats.completionRate}%</p>
              <p className="text-purple-100 text-sm">Completion Rate</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <Clock className="h-10 w-10 mb-4 opacity-80" />
              <p className="text-3xl font-bold mb-2">{stats.pendingReviews}</p>
              <p className="text-orange-100 text-sm">Pending Reviews</p>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
