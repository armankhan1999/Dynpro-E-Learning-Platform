'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import { BarChart3, Users, TrendingUp, Award, Download, Calendar, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ManagerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [teamProgress, setTeamProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchManagerData()
  }, [])

  const fetchManagerData = async () => {
    try {
      const { reportsApi, analyticsApi } = await import('@/lib/api')

      // Fetch team statistics
      const departmentStats = await reportsApi.getDepartmentProgress()
      setStats(departmentStats)

      // Fetch team member progress
      const teamData = await analyticsApi.getTeamAnalytics()
      setTeamProgress(teamData.team_members || [])
    } catch (error) {
      console.error('Failed to fetch manager data:', error)
      const { showToast } = await import('@/lib/toast')
      showToast.error('Failed to load manager dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      const { reportsApi } = await import('@/lib/api')
      await reportsApi.exportReport('team-progress', 'csv')
      const { showToast } = await import('@/lib/toast')
      showToast.success('Report exported successfully')
    } catch (error) {
      console.error('Failed to export report:', error)
      const { showToast } = await import('@/lib/toast')
      showToast.error('Failed to export report')
    }
  }

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              Manager Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor your team's learning progress and performance
            </p>
          </div>
          <Button 
            onClick={handleExportReport}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold mt-2">{stats?.total_members || 0}</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avg Completion</p>
              <p className="text-3xl font-bold mt-2">{stats?.avg_completion || 0}%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Certificates</p>
              <p className="text-3xl font-bold mt-2">{stats?.total_certificates || 0}</p>
            </div>
            <Award className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Courses</p>
              <p className="text-3xl font-bold mt-2">{stats?.active_enrollments || 0}</p>
            </div>
            <Target className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/manager/team-progress">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
            <Users className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Team Progress</h3>
            <p className="text-sm text-gray-600">View detailed progress of all team members</p>
          </div>
        </Link>

        <Link href="/manager/reports">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
            <BarChart3 className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reports</h3>
            <p className="text-sm text-gray-600">Access comprehensive team reports</p>
          </div>
        </Link>

        <Link href="/manager/compliance">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
            <Calendar className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance</h3>
            <p className="text-sm text-gray-600">Track mandatory training completion</p>
          </div>
        </Link>
      </div>

      {/* Team Progress Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Members Progress</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamProgress.length > 0 ? (
                teamProgress.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.active_courses || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.completed_courses || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${member.avg_progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{member.avg_progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.certificates || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.avg_progress >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : member.avg_progress >= 50 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.avg_progress >= 80 ? 'On Track' : member.avg_progress >= 50 ? 'Needs Attention' : 'At Risk'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
