'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, TrendingUp, Users, BookOpen, Award } from 'lucide-react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { reportsApi } = await import('@/lib/api')
      const data = await reportsApi.getEnrollmentReport()
      setReports(data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              Reports & Analytics
            </h1>
            <p className="mt-2 text-gray-600">Platform performance and insights</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <Users className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-3xl font-bold mb-2">1,250</p>
            <p className="text-blue-100 text-sm">Total Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <BookOpen className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-3xl font-bold mb-2">85</p>
            <p className="text-green-100 text-sm">Active Courses</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <TrendingUp className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-3xl font-bold mb-2">3,420</p>
            <p className="text-purple-100 text-sm">Enrollments</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <Award className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-3xl font-bold mb-2">72%</p>
            <p className="text-orange-100 text-sm">Completion Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: User growth over time</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Top performing courses</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Enrollment Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Enrollment trends</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Revenue by month</p>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
