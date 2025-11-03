'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus, Search, TrendingUp, Clock, MessageCircle, Eye } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Discussion {
  id: string
  title: string
  content: string
  author: string
  course_title: string
  replies_count: number
  views_count: number
  is_pinned: boolean
  created_at: string
}

export default function DiscussionsPage() {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'my-posts' | 'trending'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscussions()
  }, [filter])

  const fetchDiscussions = async () => {
    setLoading(true)
    try {
      const { discussionsApi } = await import('@/lib/api')
      const data = await discussionsApi.getAll()
      setDiscussions(data.discussions || [])
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
      showToast.error('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
              Discussions
            </h1>
            <p className="mt-2 text-gray-600">Join the conversation with fellow learners</p>
          </div>
          <Link href="/discussions/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'my-posts', 'trending'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'my-posts' ? 'My Posts' : 'Trending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading discussions...</p>
          </div>
        ) : filteredDiscussions.length > 0 ? (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {discussion.is_pinned && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            Pinned
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {discussion.course_title}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
                        {discussion.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies_count} replies
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          {discussion.views_count} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {discussion.author.charAt(0)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">{discussion.author}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-6">Be the first to start a discussion!</p>
            <Link href="/discussions/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Start Discussion
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
