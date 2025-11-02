'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  role: string
  profile_image_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = sessionStorage.getItem('access_token')
      if (token) {
        const userData = await apiClient.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      sessionStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { user: userData } = await apiClient.login(email, password)
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    sessionStorage.removeItem('access_token')
    setUser(null)
    router.push('/login')
  }

  const register = async (data: any) => {
    const userData = await apiClient.register(data)
    // Auto-login after registration
    await login(data.email, data.password)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
