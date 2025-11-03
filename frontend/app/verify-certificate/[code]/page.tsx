'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'

interface VerificationResult {
  valid: boolean
  message?: string
  certificate_number?: string
  issued_to?: string
  course_title?: string
  issued_at?: string
  expires_at?: string
}

export default function VerifyCertificatePage() {
  const params = useParams()
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [isManualVerify, setIsManualVerify] = useState(false)

  useEffect(() => {
    if (params.code) {
      verifyCertificate(params.code as string)
    } else {
      setLoading(false)
      setIsManualVerify(true)
    }
  }, [params.code])

  const verifyCertificate = async (code: string) => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/verify/${code}`,
        {
          method: 'GET'
        }
      )

      const data = await response.json()
      setVerificationResult(data)
    } catch (error) {
      console.error('Verification failed:', error)
      setVerificationResult({
        valid: false,
        message: 'Failed to verify certificate. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      verifyCertificate(manualCode.trim())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying certificate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-20">
              <Image
                src="/dynpro-logo.png"
                alt="DynPro"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">Verify the authenticity of DynPro certificates</p>
        </div>

        {/* Manual Verification Form */}
        {(isManualVerify || !verificationResult) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter certificate verification code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                <Search className="mr-2 h-5 w-5" />
                Verify Certificate
              </Button>
            </form>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${
            verificationResult.valid ? 'border-4 border-green-500' : 'border-4 border-red-500'
          }`}>
            {/* Status Header */}
            <div className={`p-6 ${
              verificationResult.valid ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-center">
                {verificationResult.valid ? (
                  <CheckCircle className="h-16 w-16 text-green-600 mr-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600 mr-4" />
                )}
                <div>
                  <h2 className={`text-3xl font-bold ${
                    verificationResult.valid ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {verificationResult.valid ? 'Valid Certificate' : 'Invalid Certificate'}
                  </h2>
                  <p className={`text-lg ${
                    verificationResult.valid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.message ||
                     (verificationResult.valid ? 'This certificate is authentic' : 'Could not verify this certificate')}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            {verificationResult.valid && (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {verificationResult.certificate_number}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Issued To</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {verificationResult.issued_to}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Course</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {verificationResult.course_title}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Issue Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {verificationResult.issued_at &&
                        new Date(verificationResult.issued_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      }
                    </p>
                  </div>

                  {verificationResult.expires_at && (
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Expiration Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(verificationResult.expires_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <p className="text-sm text-blue-800">
                      This certificate has been verified as authentic and was issued by DynPro Learning Platform.
                      The information shown above matches our records.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerificationResult(null)
                    setManualCode('')
                    setIsManualVerify(true)
                  }}
                >
                  Verify Another Certificate
                </Button>
                <Link href="/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Verify a Certificate</h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">1.</span>
              <span>Obtain the verification code from the certificate holder or from the certificate document itself.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">2.</span>
              <span>Enter the verification code in the form above.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">3.</span>
              <span>Click "Verify Certificate" to check the authenticity and view details.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
