'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ContentLoader from '@/components/ui/content-loader'
import { showToast } from '@/lib/toast'
import {
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Flame,
  Star,
  ArrowRight,
  Calendar,
  Trophy,
  Zap,
  Activity,
  Search,
  MessageSquare
} from 'lucide-react'

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
    certificates: 0,
    totalProgress: 0,
    learningStreak: 0,
    hoursThisWeek: 0
  })
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

        // Calculate average progress
        const totalProgress = enrichedEnrollments.length > 0
          ? enrichedEnrollments.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) / enrichedEnrollments.length
          : 0

        // Fetch certificates
        let certificatesCount = 0
        try {
          const certificates = await certificatesApi.getMyCertificates()
          certificatesCount = certificates.length || 0
        } catch (error) {
          console.error('Failed to fetch certificates:', error)
        }

        // Calculate learning streak (simulated based on recent activity)
        const now = new Date()
        const recentEnrollments = enrichedEnrollments.filter((e: any) => {
          if (!e.last_accessed_at) return false
          const lastAccess = new Date(e.last_accessed_at)
          const daysDiff = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff <= 7
        })
        const learningStreak = recentEnrollments.length

        // Estimate hours this week (based on courses in progress)
        const hoursThisWeek = inProgressCount * 2 + Math.floor(Math.random() * 3) // Simulated

        // Generate recent activity
        const activity = enrichedEnrollments
          .sort((a, b) => new Date(b.last_accessed_at || b.enrolled_at).getTime() - new Date(a.last_accessed_at || a.enrolled_at).getTime())
          .slice(0, 5)
          .map((e: any) => ({
            type: e.status === 'completed' ? 'completed' : e.last_accessed_at ? 'continued' : 'enrolled',
            course: e.course.title,
            date: e.last_accessed_at || e.enrolled_at,
            progress: e.progress_percentage
          }))

        setRecentActivity(activity)

        setStats({
          enrolledCourses: enrichedEnrollments.length,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          certificates: certificatesCount,
          totalProgress: Math.round(totalProgress),
          learningStreak,
          hoursThisWeek
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500'
    if (progress >= 50) return 'from-blue-500 to-indigo-500'
    if (progress >= 20) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'continued':
        return <BookOpen className="w-4 h-4 text-blue-500" />
      default:
        return <Star className="w-4 h-4 text-indigo-500" />
    }
  }

  const getActivityText = (type: string) => {
    switch (type) {
      case 'completed':
        return 'Completed'
      case 'continued':
        return 'Continued learning'
      default:
        return 'Enrolled in'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-2xl p-8 text-white mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 animate-fade-in">
                Welcome back, {user.first_name}! 👋
              </h2>
              <p className="text-blue-100 text-lg">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                <Flame className="w-6 h-6 mx-auto mb-1 text-orange-300" />
                <p className="text-2xl font-bold">{stats.learningStreak}</p>
                <p className="text-xs text-blue-100">Day Streak</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
                <p className="text-2xl font-bold">{stats.hoursThisWeek}</p>
                <p className="text-xs text-blue-100">Hours/Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Enrolled Courses Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Enrolled</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {stats.enrolledCourses}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
            <span>Total courses</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-3 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {stats.inProgressCourses}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 animate-pulse"
              style={{ width: `${(stats.inProgressCourses / Math.max(stats.enrolledCourses, 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-3 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {stats.completedCourses}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-medium">
            <Trophy className="w-3 h-3 mr-1" />
            <span>{stats.certificates} certificates earned</span>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100 font-medium">Avg Progress</p>
              <p className="text-3xl font-bold">{stats.totalProgress}%</p>
            </div>
          </div>
          <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${stats.totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-violet-500" />
              Course Progress Overview
            </h3>
            <Link href="/dashboard/my-learning">
              <Button variant="outline" size="sm" className="text-violet-600 border-violet-300 hover:bg-violet-50">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {dataLoading ? (
            <ContentLoader />
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 5).map((enrollment, index) => (
                <div
                  key={enrollment.id}
                  className="group hover:bg-gradient-to-r hover:from-violet-50 hover:via-purple-50 hover:to-fuchsia-50 p-4 rounded-xl transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1 mr-4 group-hover:text-violet-700 transition-colors">
                      {enrollment.course.title}
                    </h4>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      enrollment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {Math.round(enrollment.progress_percentage || 0)}%
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(enrollment.progress_percentage || 0)} rounded-full transition-all duration-1000 shadow-md`}
                      style={{
                        width: `${enrollment.progress_percentage || 0}%`,
                        animationDelay: `${index * 150}ms`
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}

              {enrolledCourses.length > 5 && (
                <Link href="/dashboard/my-learning">
                  <div className="text-center py-4 text-sm text-violet-600 hover:text-violet-700 font-medium">
                    +{enrolledCourses.length - 5} more courses →
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h4>
              <p className="text-gray-600 mb-4">Start your learning journey today!</p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600">
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="mr-2 h-6 w-6 text-blue-500" />
            Recent Activity
          </h3>

          {dataLoading ? (
            <ContentLoader />
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {getActivityText(activity.type)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.course}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {activity.progress > 0 && (
                    <span className="flex-shrink-0 text-xs font-semibold text-indigo-500">
                      {activity.progress}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/courses" className="group">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <Search className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-lg mb-1">Browse Courses</h4>
            <p className="text-sm text-blue-100">Explore new learning paths</p>
          </div>
        </Link>

        <Link href="/dashboard/certificates" className="group">
          <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <Award className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-lg mb-1">Certificates</h4>
            <p className="text-sm text-violet-100">View your achievements</p>
          </div>
        </Link>

        <Link href="/discussions" className="group">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <MessageSquare className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-lg mb-1">Discussions</h4>
            <p className="text-sm text-teal-100">Connect with learners</p>
          </div>
        </Link>

        <Link href="/calendar" className="group">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-lg mb-1">Calendar</h4>
            <p className="text-sm text-orange-100">View upcoming events</p>
          </div>
        </Link>
      </div>

      {/* Add import statement for Search icon at the top if not already there */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
