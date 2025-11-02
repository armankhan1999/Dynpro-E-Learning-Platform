'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { User, BookOpen, Award, Calendar } from 'lucide-react'

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [params.userId])

  const fetchProfile = async () => {
    try {
      const { usersApi } = await import('@/lib/api')
      const data = await usersApi.getById(params.userId)
      setProfile(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
              <p className="text-gray-700 mt-2">{profile.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{profile.courses_completed}</p>
              <p className="text-sm text-gray-600">Courses</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{profile.badges}</p>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{profile.points}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">Member Since</p>
              <p className="text-sm text-gray-600">{new Date(profile.member_since).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
