'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi, usersApi } from '@/lib/api'
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
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await authApi.getCurrentUser(token)
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('token', data.access_token)
    const userData = await authApi.getCurrentUser(data.access_token)
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await authApi.logout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      router.push('/login')
    }
  }

  const register = async (data: any) => {
    await authApi.register(data)
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
