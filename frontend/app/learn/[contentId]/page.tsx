'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

export default function LearnContentPage({ params }: { params: { contentId: string } }) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    fetchContent()
  }, [params.contentId])

  const fetchContent = async () => {
    try {
      const { contentApi } = await import('@/lib/api')
      const data = await contentApi.getContent(params.contentId)
      setContent(data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            Introduction to React Hooks
          </h1>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700">
              React Hooks are functions that let you use state and other React features without writing a class.
              In this lesson, we'll explore the most commonly used hooks and how to implement them in your applications.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Key Concepts:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>useState for managing component state</li>
              <li>useEffect for side effects</li>
              <li>useContext for consuming context</li>
              <li>Custom hooks for reusable logic</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
            <Button variant="outline">
              Next Lesson
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
