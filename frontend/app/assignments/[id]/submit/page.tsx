'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Send } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [submission, setSubmission] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!submission.trim()) {
      showToast.warning('Please provide your submission')
      return
    }

    setSubmitting(true)
    try {
      const { assignmentsApi } = await import('@/lib/api')
      await assignmentsApi.submit(params.id, { submission, file })
      showToast.success('Assignment submitted successfully')
      router.push('/dashboard/my-learning')
    } catch (error) {
      console.error('Failed to submit assignment:', error)
      showToast.error('Failed to submit assignment')
      setSubmitting(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Submit Assignment
          </h1>
          <p className="mt-2 text-gray-600">Complete and submit your assignment</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Details</label>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-gray-900 mb-2">Build a React Component</h3>
                <p className="text-gray-600 text-sm">Create a reusable button component with props for styling and behavior.</p>
                <p className="text-sm text-gray-500 mt-2">Due: Jan 20, 2024</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Submission</label>
              <textarea
                rows={8}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your solution and approach..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Upload a file</span>
                  <span className="text-gray-600"> or drag and drop</span>
                </label>
                {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </ModernDashboardLayout>
  )
}
