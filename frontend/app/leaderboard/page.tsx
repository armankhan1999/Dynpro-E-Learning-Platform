'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import ContentLoader from '@/components/ui/content-loader'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  first_name: string
  last_name: string
  points: number
  courses_completed: number
  badges_earned: number
  avatar?: string
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month')
  const [category, setCategory] = useState<'global' | 'team'>('global')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe, category])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const { gamificationApi } = await import('@/lib/api')
      const data = await gamificationApi.getLeaderboard(timeframe)
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Medal className="h-8 w-8 text-amber-600" />
      default:
        return <span className="text-2xl font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400'
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600'
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
    }
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <ContentLoader />
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="mr-3 h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="mt-2 text-gray-600">
            See how you rank against other learners
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <div className="flex gap-2">
                {(['week', 'month', 'all'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex gap-2">
                {(['global', 'team'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'global' ? (
                      <span className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Global
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        My Team
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl shadow-lg p-6 mb-4">
                  <Medal className="h-12 w-12 text-white mx-auto mb-3" />
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {leaderboard[1]?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{leaderboard[1]?.first_name} {leaderboard[1]?.last_name}</h3>
                  <p className="text-gray-100 text-sm">@{leaderboard[1].username}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-2xl font-bold text-white">{leaderboard[1].points}</p>
                    <p className="text-xs text-gray-100">points</p>
                  </div>
                </div>
                <div className="bg-gray-300 h-24 rounded-t-xl"></div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-2xl p-6 mb-4 transform scale-110">
                  <Trophy className="h-16 w-16 text-white mx-auto mb-3 animate-bounce" />
                  <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center ring-4 ring-yellow-300">
                    <span className="text-3xl font-bold text-yellow-600">
                      {leaderboard[0]?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xl">{leaderboard[0]?.first_name} {leaderboard[0]?.last_name}</h3>
                  <p className="text-yellow-100 text-sm">@{leaderboard[0].username}</p>
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-3xl font-bold text-white">{leaderboard[0].points}</p>
                    <p className="text-xs text-yellow-100">points</p>
                  </div>
                </div>
                <div className="bg-yellow-400 h-32 rounded-t-xl"></div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 mb-4">
                  <Medal className="h-12 w-12 text-white mx-auto mb-3" />
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-700">
                      {leaderboard[2]?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{leaderboard[2]?.first_name} {leaderboard[2]?.last_name}</h3>
                  <p className="text-amber-100 text-sm">@{leaderboard[2].username}</p>
                  <div className="mt-3 pt-3 border-t border-amber-400">
                    <p className="text-2xl font-bold text-white">{leaderboard[2].points}</p>
                    <p className="text-xs text-amber-100">points</p>
                  </div>
                </div>
                <div className="bg-amber-500 h-20 rounded-t-xl"></div>
              </div>
            )}
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-xl font-bold text-white">Full Rankings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  entry.user_id === user?.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {entry.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{entry.first_name} {entry.last_name}</h3>
                      <p className="text-sm text-gray-600">@{entry.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{entry.points}</p>
                      <p className="text-xs text-gray-600">Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{entry.courses_completed}</p>
                      <p className="text-xs text-gray-600">Courses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{entry.badges_earned}</p>
                      <p className="text-xs text-gray-600">Badges</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
