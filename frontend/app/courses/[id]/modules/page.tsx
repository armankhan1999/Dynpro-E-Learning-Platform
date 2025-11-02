'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Edit, Trash2, GripVertical } from 'lucide-react'

export default function CourseModulesPage({ params }: { params: { id: string } }) {
  const [modules, setModules] = useState<any[]>([])

  useEffect(() => {
    fetchModules()
  }, [params.id])

  const fetchModules = async () => {
    try {
      const { contentApi } = await import('@/lib/api')
      const data = await contentApi.getModules(params.id)
      setModules(data.modules || [])
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            Course Modules
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>

        <div className="space-y-4">
          {modules.map((module, index) => (
            <div key={module.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-6 w-6 text-gray-400 cursor-move" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Module {index + 1}: {module.title}</h3>
                    <p className="text-gray-600">{module.lessons} lessons • {module.duration}</p>
                  </div>
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
