'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  const [replyText, setReplyText] = useState('')
  const [discussion, setDiscussion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussion()
  }, [params.id])

  const fetchDiscussion = async () => {
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

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{discussion.title}</h1>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
              {discussion.author.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{discussion.author}</p>
              <p className="text-sm text-gray-600">{new Date(discussion.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{discussion.content}</p>
          <Button variant="outline" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Helpful
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{discussion.replies.length} Replies</h2>
          {discussion.replies.map((reply) => (
            <div key={reply.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {reply.author.charAt(0)}
                </div>
                <p className="font-medium text-gray-900">{reply.author}</p>
              </div>
              <p className="text-gray-700 mb-2">{reply.content}</p>
              <Button variant="outline" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                {reply.likes}
              </Button>
            </div>
          ))}
        </div>

        <form onSubmit={handleReply} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Post a Reply</h3>
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Share your thoughts..."
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Reply className="mr-2 h-4 w-4" />
            Post Reply
          </Button>
        </form>
      </div>
    </ModernDashboardLayout>
  )
}
