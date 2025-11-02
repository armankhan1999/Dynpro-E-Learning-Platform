'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react'

export default function InstructorAssessmentsPage() {
  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const { assessmentsApi } = await import('@/lib/api')
      const data = await assessmentsApi.getAll()
      setAssessments(data.assessments || [])
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardList className="mr-3 h-8 w-8 text-blue-600" />
            My Assessments
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{assessment.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{assessment.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{assessment.questions}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{assessment.attempts}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
