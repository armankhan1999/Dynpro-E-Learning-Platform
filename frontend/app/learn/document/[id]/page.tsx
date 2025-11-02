'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { FileText, Download, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

export default function DocumentLessonPage({ params }: { params: { id: string } }) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-blue-600" />
              React Best Practices Guide
            </h1>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="prose max-w-none mb-6">
            <h2>Component Organization</h2>
            <p>Organize your React components following these best practices...</p>
            
            <h2>State Management</h2>
            <p>Choose the right state management solution for your application...</p>
            
            <h2>Performance Optimization</h2>
            <p>Optimize your React applications using these techniques...</p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Document
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Read
            </Button>
            <Button variant="outline">
              Next Document
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
