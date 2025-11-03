'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, XCircle, Clock, Save, ArrowLeft } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { ButtonLoader } from '@/components/ui/content-loader'

interface Submission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  submitted_at: string
  submission_text: string
  attachment_url?: string
  grade?: number
  feedback?: string
  status: 'submitted' | 'graded' | 'returned'
}

export default function GradeAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)

  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  })

  useEffect(() => {
    fetchAssignmentAndSubmissions()
  }, [params.id])

  const fetchAssignmentAndSubmissions = async () => {
    try {
      const { assignmentsApi } = await import('@/lib/api')
      const [assignmentData, submissionsData] = await Promise.all([
        assignmentsApi.getById(params.id),
        assignmentsApi.getSubmissions(params.id)
      ])

      setAssignment(assignmentData)
      setSubmissions(submissionsData.submissions || [])

      // Auto-select first submission
      if (submissionsData.submissions && submissionsData.submissions.length > 0) {
        selectSubmission(submissionsData.submissions[0])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      showToast.error('Failed to load assignment data')
    } finally {
      setLoading(false)
    }
  }

  const selectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGradeForm({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
    })
  }

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return

    if (!gradeForm.grade) {
      showToast.warning('Please enter a grade')
      return
    }

    const grade = parseFloat(gradeForm.grade)
    if (isNaN(grade) || grade < 0 || grade > assignment.max_points) {
      showToast.warning(`Grade must be between 0 and ${assignment.max_points}`)
      return
    }

    setGrading(true)
    try {
      const { assignmentsApi } = await import('@/lib/api')
      await assignmentsApi.gradeSubmission(
        params.id,
        selectedSubmission.id,
        {
          grade: grade,
          feedback: gradeForm.feedback
        }
      )

      showToast.success('Grade submitted successfully')

      // Update local state
      setSubmissions(submissions.map(sub =>
        sub.id === selectedSubmission.id
          ? { ...sub, grade, feedback: gradeForm.feedback, status: 'graded' }
          : sub
      ))

      // Move to next ungraded submission
      const currentIndex = submissions.findIndex(s => s.id === selectedSubmission.id)
      const nextUngraded = submissions.slice(currentIndex + 1).find(s => !s.grade)
      if (nextUngraded) {
        selectSubmission(nextUngraded)
      }
    } catch (error: any) {
      console.error('Failed to submit grade:', error)
      showToast.error(error.response?.data?.detail || 'Failed to submit grade')
    } finally {
      setGrading(false)
    }
  }

  const downloadAttachment = async (url: string) => {
    try {
      window.open(url, '_blank')
      showToast.success('Opening attachment')
    } catch (error) {
      showToast.error('Failed to open attachment')
    }
  }

  const getStatusBadge = (submission: Submission) => {
    if (submission.status === 'graded') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    }
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  if (!assignment) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Not Found</h3>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Grade: {assignment.title}
          </h1>
          <p className="text-gray-600 mt-2">
            {submissions.filter(s => s.grade).length} / {submissions.length} submissions graded
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Submissions ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => selectSubmission(submission)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedSubmission?.id === submission.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {submission.student_name}
                          </p>
                          <p className="text-xs text-gray-500">{submission.student_email}</p>
                        </div>
                        {getStatusBadge(submission)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                      {submission.grade !== undefined && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Grade: {submission.grade} / {assignment.max_points}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedSubmission.student_name}'s Submission
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                    </span>
                    {getStatusBadge(selectedSubmission)}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">Assignment Details</h3>
                  <p className="text-gray-700 text-sm">{assignment.description}</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Max Points: {assignment.max_points}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Due: {new Date(assignment.due_date).toLocaleString()}
                  </p>
                </div>

                {/* Student Submission */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Student Submission</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedSubmission.submission_text || 'No text submission'}
                    </p>
                  </div>

                  {selectedSubmission.attachment_url && (
                    <Button
                      onClick={() => downloadAttachment(selectedSubmission.attachment_url!)}
                      variant="outline"
                      className="mt-3"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      View Attachment
                    </Button>
                  )}
                </div>

                {/* Grading Form */}
                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">Grade Submission</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade (out of {assignment.max_points}) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={assignment.max_points}
                        step="0.5"
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback
                      </label>
                      <textarea
                        rows={6}
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide constructive feedback to the student..."
                      />
                    </div>

                    <Button
                      onClick={handleSubmitGrade}
                      disabled={grading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {grading ? <ButtonLoader /> : <Save className="mr-2 h-4 w-4" />}
                      {grading ? 'Submitting...' : 'Submit Grade'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Submission Selected</h3>
                <p className="text-gray-600">Select a submission from the list to start grading</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
