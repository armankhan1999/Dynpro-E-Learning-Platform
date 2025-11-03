'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import ContentLoader from '@/components/ui/content-loader'
import CertificateTemplate from '@/components/certificates/certificate-template'
import { Download, Printer, Share2, ArrowLeft } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Certificate {
  id: string
  title: string
  certificate_number: string
  verification_code: string
  issued_at: string
  course_id: string
  user_id: string
}

interface User {
  first_name: string
  last_name: string
  email: string
}

interface Course {
  title: string
}

export default function CertificateViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const certificateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCertificate()
  }, [params.id])

  const fetchCertificate = async () => {
    try {
      const { certificatesApi, coursesApi } = await import('@/lib/api')

      // Fetch certificate
      const certData = await certificatesApi.getById(params.id as string)
      setCertificate(certData)

      // Fetch course details
      const course = await coursesApi.getById(certData.course_id)
      setCourseTitle(course.title)

      // Set user name
      if (user?.first_name && user?.last_name) {
        setUserName(`${user.first_name} ${user.last_name}`)
      } else {
        setUserName(user?.username || 'Student')
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error)
      showToast.error('Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      // Use html2canvas to convert the certificate to an image
      const html2canvas = (await import('html2canvas')).default

      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        })

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `certificate-${certificate?.certificate_number}.png`
            link.click()
            URL.revokeObjectURL(url)
            showToast.success('Certificate downloaded')
          }
        })
      }
    } catch (error) {
      console.error('Failed to download certificate:', error)
      showToast.error('Failed to download certificate. Please try printing instead.')
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/verify-certificate/${certificate?.verification_code}`

      if (navigator.share) {
        await navigator.share({
          title: `Certificate: ${courseTitle}`,
          text: `Check out my certificate for ${courseTitle}`,
          url: shareUrl
        })
        showToast.success('Certificate shared')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast.success('Certificate verification link copied to clipboard')
      }
    } catch (error) {
      console.error('Failed to share certificate:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ContentLoader />
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate not found</h2>
          <Button onClick={() => router.push('/dashboard/certificates')}>
            Back to Certificates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden when printing */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/certificates')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Certificates
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="max-w-5xl mx-auto py-8 px-4 print:p-0">
        <div ref={certificateRef} className="print:shadow-none">
          <CertificateTemplate
            certificateNumber={certificate.certificate_number}
            recipientName={userName}
            courseName={courseTitle}
            issueDate={certificate.issued_at}
            verificationCode={certificate.verification_code}
          />
        </div>

        {/* Verification Info - Hidden when printing */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Verification</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Certificate Number:</span> {certificate.certificate_number}
            </p>
            <p>
              <span className="font-medium">Verification Code:</span> {certificate.verification_code}
            </p>
            <p>
              <span className="font-medium">Verification URL:</span>{' '}
              <a
                href={`/verify-certificate/${certificate.verification_code}`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {window.location.origin}/verify-certificate/{certificate.verification_code}
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              This certificate can be verified by visiting the verification URL above or by entering the
              verification code on the certificate verification page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
