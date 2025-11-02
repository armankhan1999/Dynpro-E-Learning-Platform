'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, BarChart3 } from 'lucide-react'

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { coursesApi } = await import('@/lib/api')
      const data = await coursesApi.getAll() // Filter by instructor on backend
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            My Courses
          </h1>
          <Link href="/courses/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">{course.students} students</span>
                <span className="text-yellow-500">⭐ {course.rating}</span>
              </div>
              <Link href={`/instructor/courses/${course.id}/analytics`}>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
