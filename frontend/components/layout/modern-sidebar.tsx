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

const instructorNavigation: NavItem[] = [
  { name: 'My Courses', href: '/instructor/courses', icon: BookOpen, roles: ['instructor', 'admin', 'super_admin'] },
  { name: 'Create Course', href: '/courses/create', icon: FileText, roles: ['instructor', 'admin', 'super_admin'] },
]

const managerNavigation: NavItem[] = [
  { name: 'Manager Dashboard', href: '/manager', icon: BarChart3, roles: ['manager', 'admin', 'super_admin'] },
  { name: 'Team Progress', href: '/manager/team-progress', icon: Users, roles: ['manager', 'admin', 'super_admin'] },
  { name: 'Team Reports', href: '/manager/reports', icon: FileText, roles: ['manager', 'admin', 'super_admin'] },
]

const adminNavigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, roles: ['admin', 'super_admin'] },
  { name: 'Manage Courses', href: '/admin/courses', icon: FileText, roles: ['admin', 'super_admin'] },
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

  const filteredInstructorNav = instructorNavigation.filter(canAccessItem)
  const filteredManagerNav = managerNavigation.filter(canAccessItem)
  const filteredAdminNav = adminNavigation.filter(canAccessItem)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/40 border-r border-blue-100 shadow-xl">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm ${collapsed ? 'justify-center' : 'justify-start'}`}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              DynPro Edu
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              DE
            </span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard')
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-400/50 scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 hover:text-gray-900 hover:scale-105'
                }`}
                title={collapsed ? item.name : ''}
              >
                <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto">
                    <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Instructor Navigation */}
        {filteredInstructorNav.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teaching
                </h3>
              )}
              {collapsed && <div className="border-t border-blue-100 my-2"></div>}
            </div>
            <div className="space-y-1">
              {filteredInstructorNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-400/50 scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100 hover:text-gray-900 hover:scale-105'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-600'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Manager Navigation */}
        {filteredManagerNav.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Management
                </h3>
              )}
              {collapsed && <div className="border-t border-blue-100 my-2"></div>}
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
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-400/50 scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-100 hover:via-teal-100 hover:to-cyan-100 hover:text-gray-900 hover:scale-105'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`} />
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
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
              )}
              {collapsed && <div className="border-t border-blue-100 my-2"></div>}
            </div>
            <div className="space-y-1">
              {filteredAdminNav.map((item) => {
                const isActive = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/admin')
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-400/50 scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-violet-100 hover:via-purple-100 hover:to-fuchsia-100 hover:text-gray-900 hover:scale-105'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-violet-600'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-blue-100 p-4 bg-white/80 backdrop-blur-sm">
        {!collapsed ? (
          <>
            <div className="flex items-center mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:text-red-600" />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border-2 border-blue-200 rounded-full items-center justify-center text-gray-600 hover:text-blue-500 hover:border-blue-400 hover:shadow-lg transition-all duration-200 shadow-md"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
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
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-blue-400/50 transition-all duration-200"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  )
}
