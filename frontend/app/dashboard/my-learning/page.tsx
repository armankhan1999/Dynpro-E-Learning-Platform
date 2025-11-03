'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import { showToast } from '@/lib/toast'
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react'

interface EnrollmentWithCourse {
  id: string
  course_id: string
  course: {
    id: string
    title: string
    description?: string
    thumbnail_url?: string
  }
  progress_percentage: number
  status: string
  enrolled_at: string
  last_accessed_at?: string
}

export default function MyLearningPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const { enrollmentsApi, coursesApi } = await import('@/lib/api')
      const enrollmentsData = await enrollmentsApi.getMyEnrollments()

      // Enrich enrollments with course data
      const enrichedEnrollments = await Promise.all(
        enrollmentsData.map(async (enrollment: any) => {
          try {
            const course = await coursesApi.getById(enrollment.course_id)
            return {
              ...enrollment,
              course
            }
          } catch (error) {
            console.error(`Failed to fetch course ${enrollment.course_id}:`, error)
            return {
              ...enrollment,
              course: {
                id: enrollment.course_id,
                title: 'Unknown Course',
                description: ''
              }
            }
          }
        })
      )

      setEnrollments(enrichedEnrollments)
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
      showToast.error('Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'all') return true
    if (filter === 'in_progress') return enrollment.status === 'in_progress'
    if (filter === 'completed') return enrollment.status === 'completed'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ContentLoader />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'in_progress').length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === 'all'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Courses ({enrollments.length})
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === 'in_progress'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                In Progress ({enrollments.filter(e => e.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === 'completed'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({enrollments.filter(e => e.status === 'completed').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{enrollment.course.title}</h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    {enrollment.last_accessed_at && (
                      <span>Last accessed: {new Date(enrollment.last_accessed_at).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{Math.round(enrollment.progress_percentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          enrollment.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${enrollment.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {enrollment.status === 'completed' && (
                    <div className="inline-flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <Link href={`/courses/${enrollment.course_id}/learn`}>
                    <Button>
                      {enrollment.status === 'completed' ? 'Review' : 'Continue Learning'}
                    </Button>
                  </Link>
                  <Link href={`/courses/${enrollment.course_id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredEnrollments.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all'
                  ? "You haven't enrolled in any courses yet."
                  : `No ${filter.replace('_', ' ')} courses.`}
              </p>
              <div className="mt-6">
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
