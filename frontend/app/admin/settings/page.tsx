'use client'

import { useState } from 'react'
import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Settings, Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'E-Learning Platform',
    siteUrl: 'https://elearning.example.com',
    adminEmail: 'admin@example.com',
    allowRegistration: true,
    requireEmailVerification: true,
    maxUploadSize: '100',
    sessionTimeout: '30'
  })

  const handleSave = async () => {
    try {
      const { settingsApi } = await import('@/lib/api')
      await settingsApi.updatePlatformSettings(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            Platform Settings
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
