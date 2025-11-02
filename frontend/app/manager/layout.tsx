'use client'

import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <ModernDashboardLayout>{children}</ModernDashboardLayout>
}
