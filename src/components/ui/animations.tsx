'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

// Fade In
export function FadeIn({ children, delay = 0, duration = 0.4, direction = 'up', className = '' }: {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}) {
  const directions = { up: { y: 8 }, down: { y: -8 }, left: { x: 8 }, right: { x: -8 } }
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale In
export function ScaleIn({ children, delay = 0, className = '' }: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger Container
export function StaggerContainer({ children, className = '' }: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item
export function StaggerItem({ children, className = '' }: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated Page
export function AnimatedPage({ children, viewKey }: {
  children: ReactNode
  viewKey: string
}) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Pulse Dot
export function PulseDot({ color = 'bg-emerald-500', size = 'sm' }: {
  color?: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
  return (
    <span className={`relative flex ${sizeClass}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${sizeClass} ${color}`} />
    </span>
  )
}

// Animated Card
export function AnimatedCard({ children, delay = 0, className = '' }: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
