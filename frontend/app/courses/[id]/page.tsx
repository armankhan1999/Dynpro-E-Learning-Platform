'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/content-loader'
import { useAuth } from '@/lib/auth-context'
import { showToast, toastMessages } from '@/lib/toast'
import { Star, Share2 } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  order_index: number
  content_count: number
}

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  duration_hours: number
  difficulty_level: string
  enrollments_count: number
  rating?: number
  reviews_count?: number
  modules: Module[]
  learning_objectives?: string[]
  prerequisites?: string[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    fetchCourseDetails()
    if (user) {
      checkEnrollmentStatus()
    }
  }, [params.id, user])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const { coursesApi } = await import('@/lib/api')
      const data = await coursesApi.getById(params.id as string)
      setCourse(data)

      // Fetch modules separately
      try {
        const modulesData = await coursesApi.getModules(params.id as string)
        if (modulesData && modulesData.modules) {
          setModules(modulesData.modules)
        }
      } catch (moduleError) {
        console.error('Failed to fetch modules:', moduleError)
        setModules([])
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
      showToast.error(toastMessages.loadError('course details'))
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentStatus = async () => {
    try {
      const { enrollmentsApi } = await import('@/lib/api')
      const enrollments = await enrollmentsApi.getMyEnrollments()
      const enrolled = enrollments.some((e: any) => e.course_id === params.id)
      setIsEnrolled(enrolled)
    } catch (error) {
      console.error('Failed to check enrollment:', error)
    }
  }


  const handleEnroll = async () => {
    if (!user) {
      showToast.info('Please login to enroll in courses')
      router.push('/login')
      return
    }

    setEnrolling(true)
    try {
      const { enrollmentsApi } = await import('@/lib/api')
      await enrollmentsApi.create({ course_id: params.id })
      setIsEnrolled(true)
      showToast.success(toastMessages.enrolled)
      // Refresh course data to update enrollment count
      fetchCourseDetails()
    } catch (error: any) {
      console.error('Enrollment failed:', error)
      const message = error.response?.data?.detail || 'Failed to enroll in course'
      showToast.error(message)
    } finally {
      setEnrolling(false)
    }
  }


  const handleRating = async (rating: number) => {
    if (!user) {
      showToast.info('Please login to rate courses')
      router.push('/login')
      return
    }

    if (!isEnrolled) {
      showToast.warning('Please enroll in the course before rating')
      return
    }

    try {
      const { ratingsApi } = await import('@/lib/api')
      await ratingsApi.rateCourse(params.id as string, rating)
      setUserRating(rating)
      showToast.success('Rating submitted successfully')
      // Refresh course to update average rating
      fetchCourseDetails()
    } catch (error) {
      console.error('Rating failed:', error)
      showToast.error('Failed to submit rating')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: course?.title || 'Check out this course',
      text: course?.description || '',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        showToast.success('Course shared successfully')
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    showToast.success('Course link copied to clipboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Link href="/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/courses">
            <Button variant="outline">← Back to Courses</Button>
          </Link>
        </div>
      </header>

      {/* Course Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {course.instructor_name}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration_hours} hours
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {course.difficulty_level}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {course.enrollments_count} employees
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
                <h3 className="text-2xl font-bold mb-4">Enroll Now</h3>

                {/* Course Rating */}
                {course.rating && (
                  <div className="mb-4 flex items-center">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (course.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {course.rating?.toFixed(1)} ({course.reviews_count || 0} reviews)
                    </span>
                  </div>
                )}

                {isEnrolled ? (
                  <div>
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
                      ✓ You are enrolled in this course
                    </div>
                    <Button className="w-full mb-3" onClick={() => router.push(`/courses/${course.id}/learn`)}>
                      Continue Learning
                    </Button>

                    {/* Rate this course */}
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rate this course:</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 cursor-pointer transition-colors ${
                                star <= (hoveredRating || userRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <span className="flex items-center justify-center">
                        <ButtonLoader className="mr-2" />
                        Enrolling...
                      </span>
                    ) : (
                      'Enroll in Course'
                    )}
                  </Button>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Course
                  </Button>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Lifetime access
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Certificate of completion
                  </p>
                  <p className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Mobile and desktop access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learning_objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-4">
                {modules && modules.length > 0 ? (
                  modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{module.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                        </div>
                        <span className="text-sm text-gray-500 ml-4">{module.content_count || 0} lessons</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No modules available yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Course Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video lectures
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Downloadable resources
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Quizzes and assignments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Certificate of completion
                </li>
              </ul>
            </div>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4">Requirements</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {course.prerequisites.map((prereq: string, index: number) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
