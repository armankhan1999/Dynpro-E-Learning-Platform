'use client'

import ModernSidebar from './modern-sidebar'

export default function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <ModernSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
