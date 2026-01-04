import React from 'react'
import { motion } from 'framer-motion'

function Loader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        {/* Animated circles */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-gray-400 text-sm"
        >
          Yuklanmoqda...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Loader