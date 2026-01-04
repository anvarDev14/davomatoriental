import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, getTranslation } from '../i18n/translations'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('uz')
  const [t, setT] = useState(translations.uz)

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') || 'uz'
    setCurrentLang(savedLang)
    setT(getTranslation(savedLang))
  }, [])

  const changeLang = (lang) => {
    setCurrentLang(lang)
    setT(getTranslation(lang))
    localStorage.setItem('app_language', lang)
  }

  const languages = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]

  return (
    <LanguageContext.Provider value={{ currentLang, t, changeLang, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}