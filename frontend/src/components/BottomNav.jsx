import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { Home, Calendar, BarChart3, User, Settings, Users, FileSpreadsheet } from 'lucide-react'

function BottomNav({ role = 'student' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  const studentNav = [
    { path: '/', icon: Home, label: t.nav.home },
    { path: '/schedule', icon: Calendar, label: t.nav.schedule },
    { path: '/stats', icon: BarChart3, label: t.nav.statistics },
    { path: '/profile', icon: User, label: t.nav.profile }
  ]

  const teacherNav = [
    { path: '/teacher', icon: Home, label: t.nav.home },
    { path: '/teacher/schedule', icon: Calendar, label: t.nav.schedule },
    { path: '/teacher/stats', icon: BarChart3, label: t.nav.statistics },
    { path: '/teacher/profile', icon: User, label: t.nav.profile }
  ]

  const adminNav = [
    { path: '/admin', icon: Home, label: 'Bosh' },
    { path: '/admin/users', icon: Users, label: 'Userlar' },
    { path: '/admin/reports', icon: FileSpreadsheet, label: 'Hisobot' },
    { path: '/admin/groups', icon: User, label: 'Guruhlar' },
    { path: '/admin/settings', icon: Settings, label: 'Sozlamalar' }
  ]

  const navItems = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav
  const isAdmin = role === 'admin'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      {isAdmin ? (
        // Admin nav - horizontally scrollable
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap min-w-max px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center py-2 px-4 min-w-[72px] relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabAdmin"
                      className="absolute -top-0.5 w-10 h-1 bg-slate-800 rounded-full"
                    />
                  )}
                  <Icon
                    size={22}
                    className={isActive ? 'text-slate-800' : 'text-slate-400'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                    isActive ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        // Student/Teacher nav - normal
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
      )}
    </div>
  )
}

export default BottomNav