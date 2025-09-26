'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserData } from '@/types/auth'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data.user)
        toast.success('Login successful!')
        return true
      } else {
        toast.error(data.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string; role?: string }): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (responseData.success && responseData.data) {
        setUser(responseData.data.user)
        toast.success('Registration successful!')
        return true
      } else {
        toast.error(responseData.error || 'Registration failed')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      setUser(null)
      toast.success('Logged out successfully')
      
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
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
