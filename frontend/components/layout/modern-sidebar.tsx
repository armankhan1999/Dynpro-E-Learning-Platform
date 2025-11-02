'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Award,
  Star,
  MessageSquare,
  Calendar,
  Trophy,
  Settings,
  Users,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Learning', href: '/dashboard/my-learning', icon: BookOpen },
  { name: 'Browse Courses', href: '/courses', icon: Search },
  { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
  { name: 'Achievements', href: '/dashboard/achievements', icon: Star },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
]

const managerNavigation: NavItem[] = [
  { name: 'Manager Dashboard', href: '/manager', icon: BarChart3, roles: ['manager', 'admin', 'super_admin'] },
  { name: 'Team Progress', href: '/manager/team-progress', icon: Users, roles: ['manager', 'admin', 'super_admin'] },
  { name: 'Team Reports', href: '/manager/reports', icon: FileText, roles: ['manager', 'admin', 'super_admin'] },
]

const adminNavigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, roles: ['admin', 'super_admin'] },
  { name: 'Manage Courses', href: '/admin/courses', icon: FileText, roles: ['admin', 'super_admin', 'instructor'] },
  { name: 'Manage Users', href: '/admin/users', icon: Users, roles: ['admin', 'super_admin'] },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3, roles: ['admin', 'super_admin'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin', 'super_admin'] },
]

export default function ModernSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const canAccessItem = (item: NavItem) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || '')
  }

  const filteredManagerNav = managerNavigation.filter(canAccessItem)
  const filteredAdminNav = adminNavigation.filter(canAccessItem)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-700 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              DynPro Learning
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">DP</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            // Exact match for dashboard, prefix match for others
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard')
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                title={collapsed ? item.name : ''}
              >
                <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {/* Manager Navigation */}
        {filteredManagerNav.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Management
                </h3>
              )}
              {collapsed && <div className="border-t border-slate-700 my-2"></div>}
            </div>
            <div className="space-y-1">
              {filteredManagerNav.map((item) => {
                const isActive = item.href === '/manager'
                  ? pathname === '/manager'
                  : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/manager')
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg shadow-green-500/50'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Admin Navigation */}
        {filteredAdminNav.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </h3>
              )}
              {collapsed && <div className="border-t border-slate-700 my-2"></div>}
            </div>
            <div className="space-y-1">
              {filteredAdminNav.map((item) => {
                // Exact match for admin dashboard, prefix match for others
                const isActive = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/admin')
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700 p-4">
        {!collapsed ? (
          <>
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="relative w-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-200"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  )
}
