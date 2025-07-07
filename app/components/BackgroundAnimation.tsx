'use client'

import { motion } from 'framer-motion'

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 100, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-50 dark:opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%239CA3AF' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }} />
    </div>
  )
}