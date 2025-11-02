'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { MessageSquare, Save, X } from 'lucide-react'

export default function CreateDiscussionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { discussionsApi } = await import('@/lib/api')
      await discussionsApi.create(formData)
      router.push('/discussions')
    } catch (error) {
      console.error('Failed to create discussion:', error)
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
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What's your question?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course</option>
                <option value="1">React Advanced</option>
                <option value="2">Python Basics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your question in detail..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Post Discussion
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
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
