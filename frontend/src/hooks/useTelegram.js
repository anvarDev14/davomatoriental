import { useEffect, useState } from 'react'

export function useTelegram() {
  const [tg, setTg] = useState(null)
  const [user, setUser] = useState(null)
  const [initData, setInitData] = useState(null)

  useEffect(() => {
    const telegram = window.Telegram?.WebApp

    if (telegram) {
      setTg(telegram)
      setUser(telegram.initDataUnsafe?.user || null)
      setInitData(telegram.initData || null)
    }
  }, [])

  const close = () => {
    tg?.close()
  }

  const showAlert = (message) => {
    tg?.showAlert(message)
  }

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      tg?.showConfirm(message, (confirmed) => {
        resolve(confirmed)
      })
    })
  }

  const hapticFeedback = (type = 'light') => {
    tg?.HapticFeedback?.impactOccurred(type)
  }

  const setMainButton = (text, onClick, options = {}) => {
    if (tg?.MainButton) {
      tg.MainButton.text = text
      tg.MainButton.onClick(onClick)
      
      if (options.color) {
        tg.MainButton.color = options.color
      }
      
      if (options.textColor) {
        tg.MainButton.textColor = options.textColor
      }

      tg.MainButton.show()
    }
  }

  const hideMainButton = () => {
    tg?.MainButton?.hide()
  }

  const setBackButton = (onClick) => {
    if (tg?.BackButton) {
      tg.BackButton.onClick(onClick)
      tg.BackButton.show()
    }
  }

  const hideBackButton = () => {
    tg?.BackButton?.hide()
  }

  return {
    tg,
    user,
    initData,
    close,
    showAlert,
    showConfirm,
    hapticFeedback,
    setMainButton,
    hideMainButton,
    setBackButton,
    hideBackButton,
    colorScheme: tg?.colorScheme || 'light',
    themeParams: tg?.themeParams || {}
  }
}

export default useTelegram
