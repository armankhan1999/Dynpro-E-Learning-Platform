'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ViewAssignmentPage({ params }: { params: { id: string } }) {
  const [assignment, setAssignment] = useState<any>(null)

  useEffect(() => {
    fetchAssignment()
  }, [params.id])

  const fetchAssignment = async () => {
    try {
      const { assignmentsApi } = await import('@/lib/api')
      const data = await assignmentsApi.getById(params.id)
      setAssignment(data)
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Assignment Details
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{assignment.title}</h2>
          <p className="text-gray-700 mb-4">{assignment.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Due: {assignment.due_date}</span>
            <span className={`px-3 py-1 rounded-full ${
              assignment.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {assignment.status}
            </span>
          </div>
        </div>

        {assignment.status === 'submitted' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Grade & Feedback</h3>
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600">{assignment.grade}%</span>
              </div>
            </div>
            <p className="text-gray-700">{assignment.feedback}</p>
            <Button variant="outline" className="mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download Submission
            </Button>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
