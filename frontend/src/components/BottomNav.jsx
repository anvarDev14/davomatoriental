import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calendar, BarChart3, User } from 'lucide-react'

function BottomNav({ role = 'student' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const studentNav = [
    { path: '/', icon: Home, label: 'Bosh' },
    { path: '/schedule', icon: Calendar, label: 'Jadval' },
    { path: '/stats', icon: BarChart3, label: 'Statistika' },
    { path: '/profile', icon: User, label: 'Profil' }
  ]

  const teacherNav = [
    { path: '/teacher', icon: Home, label: 'Bosh' },
    { path: '/teacher/schedule', icon: Calendar, label: 'Jadval' },
    { path: '/teacher/stats', icon: BarChart3, label: 'Statistika' },
    { path: '/teacher/profile', icon: User, label: 'Profil' }
  ]

  const navItems = role === 'teacher' ? teacherNav : studentNav

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center py-2 px-4 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-12 h-1 bg-slate-800 rounded-full"
                />
              )}
              <Icon
                size={24}
                className={isActive ? 'text-slate-800' : 'text-slate-400'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav