'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import { BarChart3, TrendingUp, Clock, Award, Target, Calendar } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [user])

  const fetchAnalytics = async () => {
    if (!user) return
    try {
      const { analyticsApi } = await import('@/lib/api')
      const data = await analyticsApi.getUserAnalytics(user.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      showToast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
            Learning Analytics
          </h1>
          <p className="mt-2 text-gray-600">Track your learning progress and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">42h</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Learning Time</p>
            <p className="text-xs text-green-600 mt-1">+5h this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-10 w-10 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">85%</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Average Score</p>
            <p className="text-xs text-green-600 mt-1">+3% improvement</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-10 w-10 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">7</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Day Streak</p>
            <p className="text-xs text-green-600 mt-1">Keep it up!</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Progress</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Progress over time</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Completion</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Completion by category</p>
            </div>
          </div>
        </div>
    </div>
  )
}
