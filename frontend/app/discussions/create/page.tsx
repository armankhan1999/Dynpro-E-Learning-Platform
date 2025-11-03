'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { MessageSquare, Save, X, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Course {
  id: string
  title: string
}

export default function CreateDiscussionPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_id: '',
    category: 'general'
  })
  const [submitting, setSubmitting] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { coursesApi } = await import('@/lib/api')
      const data = await coursesApi.getAll(0, 100) // Fetch more courses for selection
      // Backend returns array directly, not wrapped in object
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      // Don't show error toast - courses are optional
      setCourses([])
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      showToast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const { discussionsApi } = await import('@/lib/api')

      // Prepare data - only include course_id if one is selected
      const submitData: any = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category
      }

      if (formData.course_id) {
        submitData.course_id = formData.course_id
      }

      await discussionsApi.create(submitData)
      showToast.success('Discussion created successfully')
      router.push('/discussions')
    } catch (error: any) {
      console.error('Failed to create discussion:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to create discussion'
      showToast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
            Start New Discussion
          </h1>
          <p className="mt-2 text-gray-600">Share your questions and engage with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="What's your question or topic?"
                maxLength={255}
              />
              <p className="mt-1 text-sm text-gray-500">{formData.title.length}/255 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="general">General Discussion</option>
                <option value="question">Question</option>
                <option value="help">Help Needed</option>
                <option value="resource">Resource Sharing</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Course (Optional)
              </label>
              {loadingCourses ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-500">Loading courses...</p>
                </div>
              ) : courses.length > 0 ? (
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">No specific course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-yellow-50 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    No courses available. You can still post a general discussion.
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Provide details about your question or topic. Be specific and clear to get better responses..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters ({formData.content.length} characters)
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for a great discussion:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be clear and specific in your title</li>
                <li>• Provide context and relevant details</li>
                <li>• Be respectful and professional</li>
                <li>• Search for existing discussions before posting</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting || formData.content.length < 10}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3"
              >
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Posting...' : 'Post Discussion'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => router.back()}
                className="flex-1 sm:flex-none py-3"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ModernDashboardLayout>
  )
}
