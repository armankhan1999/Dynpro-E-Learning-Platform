'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import { Trophy, Star, Target, Zap, Award, TrendingUp } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at?: string
  progress?: number
  total?: number
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const { gamificationApi } = await import('@/lib/api')
      const [badgesData, pointsData, streakData] = await Promise.all([
        gamificationApi.getMyBadges(),
        gamificationApi.getMyPoints(),
        gamificationApi.getStreak()
      ])
      setBadges(badgesData.badges || [])
      setPoints(pointsData.total_points || 0)
      setLevel(pointsData.level || 1)
      setStreak(streakData.current_streak || 0)
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnedBadges = badges.filter(b => b.earned_at)
  const inProgressBadges = badges.filter(b => !b.earned_at)

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="mr-3 h-8 w-8 text-yellow-500" />
            Achievements & Badges
          </h1>
          <p className="mt-2 text-gray-600">
            Track your progress and earn rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8" />
              <span className="text-2xl font-bold">{points}</span>
            </div>
            <p className="text-yellow-100 text-sm font-medium">Total Points</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8" />
              <span className="text-2xl font-bold">Level {level}</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Current Level</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8" />
              <span className="text-2xl font-bold">{streak} days</span>
            </div>
            <p className="text-orange-100 text-sm font-medium">Learning Streak</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8" />
              <span className="text-2xl font-bold">{earnedBadges.length}</span>
            </div>
            <p className="text-purple-100 text-sm font-medium">Badges Earned</p>
          </div>
        </div>

        {/* Earned Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </h2>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-400"
                >
                  <div className="text-5xl mb-2">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <p className="text-xs text-green-600 font-medium">
                    Earned {new Date(badge.earned_at!).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No badges earned yet. Keep learning!</p>
            </div>
          )}
        </div>

        {/* In Progress Badges */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="mr-2 h-6 w-6 text-blue-600" />
            In Progress ({inProgressBadges.length})
          </h2>
          {inProgressBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl opacity-50">{badge.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((badge.progress || 0) / (badge.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">All badges earned! Check back for new challenges.</p>
            </div>
          )}
        </div>
    </div>
  )
}
