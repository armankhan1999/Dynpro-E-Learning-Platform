'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { categoriesApi } = await import('@/lib/api')
      const data = await categoriesApi.getAll()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FolderOpen className="mr-3 h-8 w-8 text-blue-600" />
            Manage Categories
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>
              <p className="text-gray-600 mb-4">{cat.courses} courses</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
