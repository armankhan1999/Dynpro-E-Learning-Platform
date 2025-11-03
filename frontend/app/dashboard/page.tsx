'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { enrollmentsApi, certificatesApi } from '@/lib/api'
import ContentLoader from '@/components/ui/content-loader'
import { showToast } from '@/lib/toast'
import { BookOpen, Award, TrendingUp, CheckCircle } from 'lucide-react'

interface EnrolledCourse {
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

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0
  })
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      try {
        setDataLoading(true)
        const { enrollmentsApi, certificatesApi, coursesApi } = await import('@/lib/api')

        // Fetch enrollments
        const enrollments = await enrollmentsApi.getMyEnrollments()

        // Enrich enrollments with course data
        const enrichedEnrollments = await Promise.all(
          enrollments.map(async (enrollment: any) => {
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

        setEnrolledCourses(enrichedEnrollments)

        // Calculate stats
        const completedCount = enrichedEnrollments.filter((e: any) => e.status === 'completed').length
        const inProgressCount = enrichedEnrollments.filter((e: any) => e.status === 'in_progress').length

        // Fetch certificates
        let certificatesCount = 0
        try {
          const certificates = await certificatesApi.getMyCertificates()
          certificatesCount = certificates.length || 0
        } catch (error) {
          console.error('Failed to fetch certificates:', error)
        }

        setStats({
          enrolledCourses: enrichedEnrollments.length,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          certificates: certificatesCount
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        showToast.error('Failed to load dashboard data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.first_name}!
          </h2>
          <p className="text-blue-100">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.enrolledCourses}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.inProgressCourses}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.certificates}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* My Enrolled Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">My Courses</h3>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                Browse More Courses
              </Button>
            </Link>
          </div>

          {dataLoading ? (
            <ContentLoader />
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <div key={enrollment.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{enrollment.course.title}</h4>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-blue-600">{Math.round(enrollment.progress_percentage || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (enrollment.progress_percentage || 0) === 100 ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${enrollment.progress_percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {enrollment.status === 'completed' ? '✓ Completed' :
                         enrollment.status === 'in_progress' ? 'In Progress' :
                         'Enrolled'}
                      </span>
                    </div>

                    <Link href={`/courses/${enrollment.course_id}/learn`}>
                      <Button className="w-full" size="sm">
                        {enrollment.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h4>
              <p className="text-gray-600 mb-4">Start learning by browsing our course catalog</p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/courses">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Browse Courses
              </Button>
            </Link>
            <Link href="/dashboard/my-learning">
              <Button className="w-full" variant="outline">
                My Learning
              </Button>
            </Link>
            <Link href="/dashboard/certificates">
              <Button className="w-full" variant="outline">
                My Certificates
              </Button>
            </Link>
          </div>
        </div>
    </div>
  )
}
