import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    try {
      // Avval token bilan tekshirish
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const { data } = await authAPI.getMe()
          setUser(data)
          setLoading(false)
          return
        } catch (err) {
          // Token eskirgan, o'chiramiz
          localStorage.removeItem('token')
        }
      }

      // Telegram WebApp dan initData olish
      const tg = window.Telegram?.WebApp
      if (tg?.initData) {
        tg.ready()
        tg.expand()

        await login(tg.initData)
      } else {
        console.log('Telegram WebApp mavjud emas')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (initData) => {
    setError(null)

    try {
      const { data } = await authAPI.telegram(initData)

      // Backend "token" qaytaradi, "access_token" emas
      localStorage.setItem('token', data.token)
      setUser(data.user)

      return data.user
    } catch (err) {
      const message = err.response?.data?.detail || 'Login xatosi'
      setError(message)
      console.error('Login error:', err)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe()
      setUser(data)
      return data
    } catch (err) {
      console.error('Refresh user error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      updateUser,
      refreshUser,
      isStudent: user?.role === 'student',
      isTeacher: user?.role === 'teacher',
      isAdmin: user?.role === 'admin',
      isRegistered: !!(user?.student || user?.teacher)
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