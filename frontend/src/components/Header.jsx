import React from 'react'
import { useAuth } from '../context/AuthContext'

function Header({ title, subtitle }) {
  const { user } = useAuth()

  return (
    <header className="px-4 py-3 border-b border-telegram-secondary">
      <div className="flex items-center justify-between">
        <div>
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          {subtitle && <p className="text-sm text-telegram-hint">{subtitle}</p>}
        </div>
        {user && (
          <div className="w-10 h-10 bg-telegram-button rounded-full flex items-center justify-center text-telegram-buttonText font-medium">
            {user.full_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
