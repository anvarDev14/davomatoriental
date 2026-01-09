import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [needsRegistration, setNeedsRegistration] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setError(null)
      const tg = window.Telegram?.WebApp
      const initData = tg?.initData

      if (!initData) {
        // Development mode - check if token exists
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await authAPI.me()
            const userData = response.data
            setUser(userData)
            checkRegistrationStatus(userData)
          } catch (err) {
            console.error('Token validation failed:', err)
            localStorage.removeItem('token')
            setError('Telegram WebApp not found')
          }
        } else {
          setError('Telegram WebApp not found')
        }
        setLoading(false)
        return
      }

      const response = await authAPI.login(initData)

      console.log('Auth response:', response.data)

      // Backend: { token, user } qaytaradi
      const userData = response.data.user

      console.log('User data:', userData)
      console.log('User role:', userData?.role)

      setUser(userData)
      checkRegistrationStatus(userData)
    } catch (err) {
      console.error('Auth error:', err)

      // 401 - Unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        setError(err.response?.data?.detail || 'Authentication failed')
      } else {
        setError(err.response?.data?.detail || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  // Check if user needs to complete registration
  const checkRegistrationStatus = (userData) => {
    if (!userData) {
      setNeedsRegistration(false)
      return
    }

    // Admin doesn't need registration
    if (userData.role === 'admin') {
      setNeedsRegistration(false)
      return
    }

    // Student role but no student record
    if (userData.role === 'student' && !userData.student) {
      console.log('User needs student registration')
      setNeedsRegistration(true)
      return
    }

    // Teacher role but no teacher record
    if (userData.role === 'teacher' && !userData.teacher) {
      console.log('User needs teacher registration')
      setNeedsRegistration(true)
      return
    }

    setNeedsRegistration(false)
  }

  // Refresh user data after registration
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.me()
      const userData = response.data
      console.log('Refreshed user data:', userData)
      setUser(userData)
      checkRegistrationStatus(userData)
      return userData
    } catch (err) {
      console.error('Refresh user error:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
        setError('Session expired')
      }
      throw err
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setNeedsRegistration(false)
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    needsRegistration,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    checkAuth,
    refreshUser,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}