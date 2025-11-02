'use client'

import { useState, useEffect } from 'react'
import ContentLoader from '@/components/ui/content-loader'
import { Users, Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TeamProgressPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'on-track' | 'at-risk'>('all')

  useEffect(() => {
    fetchTeamProgress()
  }, [])

  const fetchTeamProgress = async () => {
    try {
      const { analyticsApi } = await import('@/lib/api')
      const data = await analyticsApi.getTeamAnalytics()
      setTeamMembers(data.team_members || [])
    } catch (error) {
      console.error('Failed to fetch team progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'on-track' && member.avg_progress >= 70) ||
      (filterStatus === 'at-risk' && member.avg_progress < 70)
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-8 w-8 text-blue-600" />
              Team Progress
            </h1>
            <p className="mt-2 text-gray-600">
              Detailed view of all team members' learning progress
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('on-track')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'on-track'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              On Track
            </button>
            <button
              onClick={() => setFilterStatus('at-risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'at-risk'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              At Risk
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {member.first_name?.charAt(0) || 'U'}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Courses</span>
                <span className="text-sm font-semibold text-gray-900">{member.active_courses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-gray-900">{member.completed_courses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Certificates</span>
                <span className="text-sm font-semibold text-gray-900">{member.certificates || 0}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{member.avg_progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      member.avg_progress >= 70 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${member.avg_progress || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  member.avg_progress >= 80 
                    ? 'bg-green-100 text-green-800' 
                    : member.avg_progress >= 50 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.avg_progress >= 80 ? (
                    <><TrendingUp className="mr-1 h-3 w-3" /> On Track</>
                  ) : member.avg_progress >= 50 ? (
                    <>Needs Attention</>
                  ) : (
                    <><TrendingDown className="mr-1 h-3 w-3" /> At Risk</>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
