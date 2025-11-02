'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Route, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState([])

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      const { learningPathsApi } = await import('@/lib/api')
      const data = await learningPathsApi.getAll()
      setPaths(data.learning_paths || [])
    } catch (error) {
      console.error('Failed to fetch learning paths:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Route className="mr-3 h-8 w-8 text-blue-600" />
            Learning Paths
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Path
          </Button>
        </div>

        <div className="space-y-4">
          {paths.map((path) => (
            <div key={path.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{path.name}</h3>
                  <p className="text-gray-600">{path.courses} courses • {path.enrollments} enrollments</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
