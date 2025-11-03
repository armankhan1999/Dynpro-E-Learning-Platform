'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import ContentLoader from '@/components/ui/content-loader'
import { MessageSquare, Plus, Search, MessageCircle, Eye, Clock, CheckCircle, Pin, User as UserIcon } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface User {
  id: string
  username: string
  first_name?: string
  last_name?: string
}

interface Discussion {
  id: string
  title: string
  content: string
  category: string | null
  user_id: string
  user?: User
  course_id: string | null
  is_pinned: boolean
  is_locked: boolean
  is_resolved: boolean
  upvotes_count: number
  replies_count: number
  views_count: number
  created_at: string
  updated_at: string
}

const categoryColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-800',
  question: 'bg-blue-100 text-blue-800',
  help: 'bg-red-100 text-red-800',
  resource: 'bg-green-100 text-green-800',
  feedback: 'bg-purple-100 text-purple-800',
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

      let data
      if (filter === 'my-posts') {
        // Fetch user's discussions
        const response = await discussionsApi.getMyDiscussions()
        data = Array.isArray(response) ? response : []
      } else if (filter === 'trending') {
        // Fetch trending discussions
        const response = await discussionsApi.getTrending()
        data = Array.isArray(response) ? response : []
      } else {
        // Fetch all discussions
        const response = await discussionsApi.getAll()
        data = Array.isArray(response) ? response : []
      }

      setDiscussions(data)
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
      showToast.error('Failed to load discussions')
      setDiscussions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getUserDisplayName = (user?: User) => {
    if (!user) return 'Unknown User'

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }

    return user.username
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
              Community Discussions
            </h1>
            <p className="mt-2 text-gray-600">Connect, collaborate, and learn together</p>
          </div>
          <Link href="/discussions/create">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              {(['all', 'my-posts', 'trending'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-md'
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
          <ContentLoader />
        ) : filteredDiscussions.length > 0 ? (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussions/${discussion.id}`}>
                <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-6 cursor-pointer border border-transparent hover:border-blue-200">
                  <div className="flex items-start justify-between gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {discussion.is_pinned && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            <Pin className="mr-1 h-3 w-3" />
                            Pinned
                          </span>
                        )}
                        {discussion.is_resolved && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                          </span>
                        )}
                        {discussion.category && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColors[discussion.category] || 'bg-gray-100 text-gray-800'}`}>
                            {discussion.category.charAt(0).toUpperCase() + discussion.category.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {discussion.title}
                      </h3>

                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {discussion.content}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies_count} {discussion.replies_count === 1 ? 'reply' : 'replies'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          {discussion.views_count} {discussion.views_count === 1 ? 'view' : 'views'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(discussion.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-shrink-0 hidden md:flex flex-col items-end">
                      <UserIcon className="h-10 w-10 text-blue-600 mb-1" />
                      <p className="text-xs text-gray-600 text-right max-w-[100px] truncate">
                        {getUserDisplayName(discussion.user)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No discussions found' : 'No discussions yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Be the first to start a discussion and engage with the community!'}
            </p>
            {!searchQuery && (
              <Link href="/discussions/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
