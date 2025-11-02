'use client'

import { useState, useEffect } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Award, Plus, Download } from 'lucide-react'

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const { certificatesApi } = await import('@/lib/api')
      const data = await certificatesApi.getAll()
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="mr-3 h-8 w-8 text-blue-600" />
            Manage Certificates
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
              <p className="text-gray-600 mb-4">{cert.issued} issued • {cert.template}</p>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
