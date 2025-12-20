import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        const { data } = await authAPI.getMe()
        setUser(data)
      } catch (err) {
        localStorage.removeItem('token')
      }
    }
    
    setLoading(false)
  }

  const login = async (initData) => {
    setLoading(true)
    setError(null)

    try {
      localStorage.setItem('initData', initData)
      
      const { data } = await authAPI.telegramAuth(initData)
      
      localStorage.setItem('token', data.access_token)
      setUser(data.user)
      
      return data.user
    } catch (err) {
      setError(err.response?.data?.detail || 'Login xatosi')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('initData')
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      updateUser,
      isStudent: user?.role === 'student',
      isTeacher: user?.role === 'teacher',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
