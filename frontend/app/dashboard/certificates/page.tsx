'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import { Award, Download, Share2, ExternalLink, Calendar, CheckCircle } from 'lucide-react'

interface Certificate {
  id: string
  course_title: string
  certificate_number: string
  verification_code: string
  issued_at: string
  expires_at?: string
  certificate_url?: string
  is_revoked: boolean
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const { certificatesApi } = await import('@/lib/api')
      const data = await certificatesApi.getMyCertificates()
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (cert: Certificate) => {
    console.log('Downloading certificate:', cert.id)
    // Implement download logic
  }

  const handleShare = (cert: Certificate) => {
    console.log('Sharing certificate:', cert.id)
    // Implement share logic
  }

  if (loading) {
    return <ContentLoader />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="mr-3 h-8 w-8 text-blue-600" />
            My Certificates
          </h1>
          <p className="mt-2 text-gray-600">
            View and download your earned certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Certificates</p>
                <p className="text-3xl font-bold mt-2">{certificates.length}</p>
              </div>
              <Award className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold mt-2">
                  {certificates.filter(c => !c.is_revoked).length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Year</p>
                <p className="text-3xl font-bold mt-2">{certificates.length}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-b-4 border-blue-600">
                  <div className="flex items-center justify-center mb-4">
                    <Award className="h-16 w-16 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Certificate of Completion
                  </h3>
                  <p className="text-center text-gray-600 font-medium">
                    {cert.course_title}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Certificate Number:</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {cert.certificate_number}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Verification Code:</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {cert.verification_code}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Issued Date:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    {cert.expires_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(cert.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(cert)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleShare(cert)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="px-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates
            </p>
            <Link href="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Courses
              </Button>
            </Link>
          </div>
        )}
    </div>
  )
}
