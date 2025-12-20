import React from 'react'

function Loader({ text = "Yuklanmoqda..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-telegram-button border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-telegram-hint">{text}</p>
    </div>
  )
}

export default Loader
