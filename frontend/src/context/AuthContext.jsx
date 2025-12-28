import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Telegram user ID olish
  const getTelegramUserId = () => {
    const tg = window.Telegram?.WebApp
    return tg?.initDataUnsafe?.user?.id || 'default'
  }

  // Token key
  const getTokenKey = () => `token_${getTelegramUserId()}`

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    const tokenKey = getTokenKey()
    const token = localStorage.getItem(tokenKey)

    if (token) {
      try {
        const { data } = await authAPI.getMe()
        setUser(data)
        setLoading(false)
        return
      } catch (err) {
        localStorage.removeItem(tokenKey)
      }
    }

    // Telegram WebApp dan auto-login
    const tg = window.Telegram?.WebApp
    if (tg?.initData) {
      tg.ready()
      tg.expand()
      try {
        await login(tg.initData)
      } catch (err) {
        console.error('Auto login failed:', err)
      }
    }

    setLoading(false)
  }

  const login = async (initData) => {
    const { data } = await authAPI.telegram(initData)
    const tokenKey = getTokenKey()
    localStorage.setItem(tokenKey, data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    const tokenKey = getTokenKey()
    localStorage.removeItem(tokenKey)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe()
      setUser(data)
      return data
    } catch (err) {
      console.error('Refresh user failed:', err)
      throw err
    }
  }

  // Ro'yxatdan o'tganmi?
  const isRegistered = user?.student || user?.teacher

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refreshUser,
      isRegistered
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)