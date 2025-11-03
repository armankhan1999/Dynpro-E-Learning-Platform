'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { MessageSquare, MessageCircle, Eye } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function MyPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPosts()
  }, [])

  const fetchMyPosts = async () => {
    try {
      const { discussionsApi } = await import('@/lib/api')
      const data = await discussionsApi.getAll() // Filter by user on backend
      setPosts(data.discussions || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      showToast.error('Failed to load your posts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
          My Posts
        </h1>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/discussions/${post.id}`}>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.replies_count} replies
                  </span>
                  <span className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    {post.views_count} views
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
