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
      const tg = window.Telegram?.WebApp
      const initData = tg?.initData

      if (!initData) {
        setError('Telegram WebApp not found')
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
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    checkAuth,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}