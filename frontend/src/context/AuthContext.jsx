import React, { createContext, useContext, useState, useEffect } from 'react'
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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Telegram WebApp dan initData olish
      const tg = window.Telegram?.WebApp
      const initData = tg?.initData

      if (!initData) {
        setError('Telegram WebApp not found')
        setLoading(false)
        return
      }

      // Backend'ga autentifikatsiya
      const response = await authAPI.login(initData)
      const userData = response.data

      console.log('Auth response:', userData) // Debug uchun

      setUser(userData)
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}z