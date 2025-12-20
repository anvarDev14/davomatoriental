import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, BarChart2, User } from 'lucide-react'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/', icon: Home, label: 'Bosh' },
    { path: '/schedule', icon: Calendar, label: 'Jadval' },
    { path: '/stats', icon: BarChart2, label: 'Statistika' },
    { path: '/profile', icon: User, label: 'Profil' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-telegram-bg border-t border-telegram-secondary">
      <div className="flex justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-1 px-4 transition-colors ${
                isActive ? 'text-telegram-button' : 'text-telegram-hint'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
