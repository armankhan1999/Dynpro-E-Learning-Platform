'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Video, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

export default function VideoLessonPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    fetchContent()
  }, [params.id])

  const fetchContent = async () => {
    try {
      const { contentApi } = await import('@/lib/api')
      const data = await contentApi.getContent(params.id)
      setContent(data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <Video className="h-24 w-24 text-white opacity-50" />
            <p className="text-white ml-4">Video Player Placeholder</p>
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">React Hooks Tutorial</h1>
            <p className="text-gray-700 mb-6">
              Learn how to use React Hooks to manage state and side effects in functional components.
            </p>

            <div className="flex items-center justify-between">
              <Button variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Video
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Watched
              </Button>
              <Button variant="outline">
                Next Video
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
