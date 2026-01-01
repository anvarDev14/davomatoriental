import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Biroz kutib, Telegram SDK yuklanganiga ishonch hosil qilish
    const timer = setTimeout(() => {
      initAuth()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getTelegramUserId = () => {
    const tg = window.Telegram?.WebApp
    return tg?.initDataUnsafe?.user?.id || 'default'
  }

  const getTokenKey = () => `token_${getTelegramUserId()}`

  const initAuth = async () => {
    console.log('=== INIT AUTH START ===')

    const tg = window.Telegram?.WebApp

    // Debug log
    console.log('Telegram object:', !!window.Telegram)
    console.log('WebApp object:', !!tg)
    console.log('initData:', tg?.initData?.substring(0, 50))
    console.log('initDataUnsafe:', tg?.initDataUnsafe)

    // Telegram SDK borligini tekshirish
    if (tg) {
      try {
        tg.ready()
        tg.expand()
      } catch (e) {
        console.error('Telegram ready/expand error:', e)
      }
    }

    const tokenKey = getTokenKey()
    const token = localStorage.getItem(tokenKey)

    console.log('Token key:', tokenKey)
    console.log('Has token:', !!token)

    // Mavjud token bilan urinish
    if (token) {
      try {
        console.log('Trying existing token...')
        const { data } = await authAPI.getMe()
        console.log('Token valid, user:', data)
        setUser(data)
        setLoading(false)
        return
      } catch (err) {
        console.error('Token invalid:', err.message)
        localStorage.removeItem(tokenKey)
      }
    }

    // Telegram initData bilan login
    if (tg?.initData && tg.initData.length > 0) {
      try {
        console.log('Trying Telegram login...')
        const { data } = await authAPI.telegram(tg.initData)
        console.log('Telegram login success:', data)

        const newTokenKey = `token_${data.user.telegram_id}`
        localStorage.setItem(newTokenKey, data.token)
        setUser(data.user)
        setLoading(false)
        return
      } catch (err) {
        console.error('Telegram login failed:', err.response?.data || err.message)
        setError(err.response?.data?.detail || err.message)
      }
    } else {
      console.log('No initData available')
      setError('initData mavjud emas')
    }

    setLoading(false)
  }

  const login = async (initData) => {
    const { data } = await authAPI.telegram(initData)
    const tokenKey = `token_${data.user.telegram_id}`
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

  const isRegistered = user?.student || user?.teacher

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
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