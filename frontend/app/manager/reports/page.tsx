'use client'

import { useState, useEffect } from 'react'
import ContentLoader from '@/components/ui/content-loader'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ManagerReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { reportsApi } = await import('@/lib/api')
      const data = await reportsApi.getTeamReport()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (reportType: string) => {
    try {
      const { reportsApi } = await import('@/lib/api')
      await reportsApi.exportReport(reportType, 'pdf')
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  if (loading) {
    return <ContentLoader />
  }

  const reportTypes = [
    {
      id: 'team-progress',
      title: 'Team Progress Report',
      description: 'Comprehensive overview of team learning progress',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'completion-rates',
      title: 'Completion Rates',
      description: 'Course completion statistics by team member',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'time-spent',
      title: 'Time Spent Analysis',
      description: 'Learning hours and engagement metrics',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'skills-matrix',
      title: 'Skills Matrix',
      description: 'Team skills and competencies overview',
      icon: TrendingUp,
      color: 'orange'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-blue-600" />
          Team Reports
        </h1>
        <p className="mt-2 text-gray-600">
          Generate and download comprehensive team reports
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${report.color}-600`} />
                </div>
                <Button 
                  onClick={() => handleDownloadReport(report.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Reports */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
        </div>
        <div className="p-6">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-600">Generated on {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent reports available</p>
          )}
        </div>
      </div>
    </div>
  )
}
