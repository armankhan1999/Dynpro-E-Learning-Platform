'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { MessageSquare, ThumbsUp, Reply, ArrowLeft, CheckCircle2, User as UserIcon } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface User {
  id: string
  username: string
  first_name?: string
  last_name?: string
}

interface Reply {
  id: string
  content: string
  user?: User
  user_id: string
  is_solution: boolean
  upvotes_count: number
  created_at: string
}

interface Discussion {
  id: string
  title: string
  content: string
  category?: string
  user?: User
  user_id: string
  is_pinned: boolean
  is_locked: boolean
  is_resolved: boolean
  upvotes_count: number
  replies_count: number
  created_at: string
  replies: Reply[]
}

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [replyText, setReplyText] = useState('')
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussion()
  }, [params.id])

  const fetchDiscussion = async () => {
    setLoading(true)
    try {
      const { discussionsApi } = await import('@/lib/api')
      const data = await discussionsApi.getById(params.id)
      setDiscussion(data)
    } catch (error) {
      console.error('Failed to fetch discussion:', error)
      showToast.error('Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyText.trim()) {
      showToast.warning('Please enter a reply')
      return
    }

    setSubmitting(true)
    try {
      const { discussionsApi } = await import('@/lib/api')
      await discussionsApi.reply(params.id, replyText)
      setReplyText('')
      showToast.success('Reply posted successfully')
      fetchDiscussion() // Refresh
    } catch (error) {
      console.error('Failed to post reply:', error)
      showToast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const getUserDisplayName = (user?: User) => {
    if (!user) return 'Unknown User'

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }

    return user.username
  }

  const getCategoryBadge = (category?: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700',
      question: 'bg-blue-100 text-blue-700',
      help: 'bg-orange-100 text-orange-700',
      resource: 'bg-green-100 text-green-700',
      feedback: 'bg-purple-100 text-purple-700'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[category || 'general']}`}>
        {(category || 'general').charAt(0).toUpperCase() + (category || 'general').slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading discussion...</p>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  if (!discussion) {
    return (
      <ModernDashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discussion Not Found</h3>
            <p className="text-gray-600 mb-4">This discussion may have been deleted or does not exist.</p>
            <Button onClick={() => router.push('/discussions')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discussions
            </Button>
          </div>
        </div>
      </ModernDashboardLayout>
    )
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/discussions')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discussions
        </Button>

        {/* Discussion Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {getCategoryBadge(discussion.category)}
            {discussion.is_resolved && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Resolved
              </span>
            )}
            {discussion.is_pinned && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                📌 Pinned
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{discussion.title}</h1>

          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <UserIcon className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{getUserDisplayName(discussion.user)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(discussion.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Helpful ({discussion.upvotes_count})
            </Button>
            <span className="text-sm text-gray-600">
              {discussion.replies_count} {discussion.replies_count === 1 ? 'Reply' : 'Replies'}
            </span>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {discussion.replies.length} {discussion.replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {discussion.replies.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {discussion.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`pb-6 border-b border-gray-200 last:border-0 ${
                    reply.is_solution ? 'bg-green-50 -m-6 p-6 rounded-lg' : ''
                  }`}
                >
                  {reply.is_solution && (
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Accepted Solution</span>
                    </div>
                  )}

                  <div className="flex items-start mb-3">
                    <UserIcon className="h-8 w-8 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{getUserDisplayName(reply.user)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="ml-0 sm:ml-11">
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {reply.upvotes_count}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {!discussion.is_locked ? (
          <form onSubmit={handleReply} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Reply className="mr-2 h-5 w-5" />
              Post a Reply
            </h3>
            <textarea
              rows={6}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4"
              placeholder="Share your thoughts, provide help, or ask for clarification..."
              disabled={submitting}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Reply className="mr-2 h-4 w-4" />
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReplyText('')}
                disabled={submitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Discussion Locked</h3>
                <p className="text-sm text-yellow-700 mt-1">This discussion has been locked and no longer accepts new replies.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  )
}
