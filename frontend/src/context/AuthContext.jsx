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
    // Telegram SDK yuklanishini kutish
    const checkTelegram = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()
        initAuth()
      } else {
        // SDK hali yuklanmagan - qayta tekshirish
        setTimeout(checkTelegram, 100)
      }
    }

    // Darhol tekshirish
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      initAuth()
    } else {
      // SDK yuklanishini kutish (max 3 soniya)
      let attempts = 0
      const maxAttempts = 30

      const waitForTelegram = setInterval(() => {
        attempts++
        if (window.Telegram?.WebApp) {
          clearInterval(waitForTelegram)
          window.Telegram.WebApp.ready()
          window.Telegram.WebApp.expand()
          initAuth()
        } else if (attempts >= maxAttempts) {
          clearInterval(waitForTelegram)
          console.log('Telegram SDK topilmadi')
          setLoading(false)
        }
      }, 100)
    }
  }, [])

  const initAuth = async () => {
    const tg = window.Telegram?.WebApp
    const tokenKey = getTokenKey()
    const token = localStorage.getItem(tokenKey)

    console.log('initAuth:', {
      hasToken: !!token,
      hasInitData: !!tg?.initData,
      initDataLength: tg?.initData?.length
    })

    if (token) {
      try {
        const { data } = await authAPI.getMe()
        setUser(data)
        setLoading(false)
        return
      } catch (err) {
        console.error('Token invalid:', err)
        localStorage.removeItem(tokenKey)
      }
    }

    // Telegram WebApp dan auto-login
    if (tg?.initData && tg.initData.length > 0) {
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