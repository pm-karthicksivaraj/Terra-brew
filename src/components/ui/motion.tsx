'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

// Page-level animation wrapper
export const PageTransition = motion.div

// Card animation
export const MotionCard = motion.div

// Table row animation (stagger)
export const MotionRow = motion.tr

// Button press animation
export const MotionButton = motion.button

// Fade-in from bottom
export const FadeIn = ({ children, delay = 0, ...props }: { children: React.ReactNode; delay?: number } & HTMLMotionProps<'div'>) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    {...props}
  >
    {children}
  </motion.div>
)

// Stagger container for lists
export const StaggerContainer = ({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'div'>) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }}
    {...props}
  >
    {children}
  </motion.div>
)

// Stagger item
export const StaggerItem = ({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'div'>) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
    }}
    {...props}
  >
    {children}
  </motion.div>
)

// Scale on hover for cards/buttons
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
}

// Slide in from side
export const SlideIn = ({ children, direction = 'left', delay = 0, ...props }: { children: React.ReactNode; direction?: 'left' | 'right' | 'up' | 'down'; delay?: number } & HTMLMotionProps<'div'>) => {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  }
  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
