'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Users, Search } from 'lucide-react'

export default function CourseStudentsPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [params.id])

  const fetchStudents = async () => {
    try {
      const { enrollmentsApi } = await import('@/lib/api')
      const data = await enrollmentsApi.getAll()
      setStudents(data.enrollments || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Users className="mr-3 h-8 w-8 text-blue-600" />
          Enrolled Students
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
