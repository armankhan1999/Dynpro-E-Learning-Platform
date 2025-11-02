'use client'

import { useState, useEffect } from 'react'
import ContentLoader from '@/components/ui/content-loader'
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function ComplianceTrackingPage() {
  const [compliance, setCompliance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompliance()
  }, [])

  const fetchCompliance = async () => {
    try {
      const { reportsApi } = await import('@/lib/api')
      const data = await reportsApi.getComplianceReport()
      setCompliance(data)
    } catch (error) {
      console.error('Failed to fetch compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="mr-3 h-8 w-8 text-blue-600" />
          Compliance Tracking
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor mandatory training completion status
        </p>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Compliant</p>
              <p className="text-3xl font-bold mt-2">{compliance?.compliant || 0}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-2">{compliance?.pending || 0}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold mt-2">{compliance?.overdue || 0}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Mandatory Courses */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Mandatory Training Courses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {compliance?.courses?.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.due_date ? new Date(course.due_date).toLocaleDateString() : 'No deadline'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.completed_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.pending_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.compliance_rate >= 100 
                        ? 'bg-green-100 text-green-800' 
                        : course.compliance_rate >= 80 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.compliance_rate || 0}% Complete
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No mandatory courses found
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
