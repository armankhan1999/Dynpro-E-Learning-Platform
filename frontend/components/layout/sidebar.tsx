'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  name: string
  href: string
  icon: string
  roles?: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'My Learning', href: '/dashboard/my-learning', icon: '📚' },
  { name: 'Browse Courses', href: '/courses', icon: '🔍' },
  { name: 'Certificates', href: '/dashboard/certificates', icon: '🏆' },
  { name: 'Achievements', href: '/dashboard/achievements', icon: '⭐' },
  { name: 'Discussions', href: '/discussions', icon: '💬' },
  { name: 'Calendar', href: '/calendar', icon: '📅' },
  { name: 'Leaderboard', href: '/leaderboard', icon: '🏅' },
]

const adminNavigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: '⚙️', roles: ['admin', 'super_admin'] },
  { name: 'Manage Courses', href: '/admin/courses', icon: '📝', roles: ['admin', 'super_admin', 'instructor'] },
  { name: 'Manage Users', href: '/admin/users', icon: '👥', roles: ['admin', 'super_admin'] },
  { name: 'Reports', href: '/admin/reports', icon: '📈', roles: ['admin', 'super_admin', 'manager'] },
  { name: 'Settings', href: '/admin/settings', icon: '🔧', roles: ['admin', 'super_admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const canAccessItem = (item: NavItem) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || '')
  }

  const filteredAdminNav = adminNavigation.filter(canAccessItem)

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-xl font-bold text-gray-900">E-Learning</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Admin Navigation */}
        {filteredAdminNav.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            <div className="space-y-1">
              {filteredAdminNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  )
}
