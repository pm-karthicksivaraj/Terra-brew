'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

// Page-level animation wrapper
export const PageTransition = motion.div

// Card animation
export const MotionCard = motion.div

// Table row animation (stagger) — renders as <tr> for valid HTML in tables
export const MotionRow = motion.tr

// Table body animation container — renders as <tbody> for valid HTML
export const MotionTbody = motion.tbody

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

// Stagger container for lists (NOT for use inside tables — use TableStaggerTbody instead)
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

// Stagger item (NOT for use inside tables — use TableStaggerRow instead)
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

// ─── Table-safe stagger animation components ───
// These render proper HTML table elements (<tbody> and <tr>) to avoid
// the "div cannot be a child of tbody" and "tr cannot be a child of div"
// hydration errors.

// Table stagger container — renders as <tbody> with stagger animation
export const TableStaggerTbody = ({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'tbody'>) => (
  <motion.tbody
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }}
    {...props}
  >
    {children}
  </motion.tbody>
)

// Table stagger row — renders as <tr> with stagger item animation
export const TableStaggerRow = ({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<'tr'>) => (
  <motion.tr
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
    }}
    {...props}
  >
    {children}
  </motion.tr>
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
