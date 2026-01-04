import React from 'react'
import { motion } from 'framer-motion'

function Loader() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-slate-800 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-slate-400 text-sm"
        >
          Yuklanmoqda...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Loader