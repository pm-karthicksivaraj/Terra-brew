'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// ---------------------------------------------------------------------------
// 1. AnimatedPage
// ---------------------------------------------------------------------------

interface AnimatedPageProps {
  viewKey: string;
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export function AnimatedPage({ viewKey, children }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// 2. FadeIn
// ---------------------------------------------------------------------------

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

function getDirectionOffset(direction: FadeInProps['direction']) {
  switch (direction) {
    case 'up':
      return { y: 16 };
    case 'down':
      return { y: -16 };
    case 'left':
      return { x: 16 };
    case 'right':
      return { x: -16 };
    case 'none':
    default:
      return {};
  }
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  direction = 'up',
  className,
}: FadeInProps) {
  const offset = getDirectionOffset(direction);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 3. StaggerContainer
// ---------------------------------------------------------------------------

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 4. StaggerItem
// ---------------------------------------------------------------------------

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 5. AnimatedCard
// ---------------------------------------------------------------------------

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        scale: 1.015,
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.12)',
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 6. CounterAnimation
// ---------------------------------------------------------------------------

interface CounterAnimationProps {
  target: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CounterAnimation({
  target,
  duration = 1500,
  className,
  prefix = '',
  suffix = '',
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) {
      // Defer to next frame so setState isn't synchronous inside the effect
      const id = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(id);
    }

    let startTime: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    }

    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// 7. SlideIn
// ---------------------------------------------------------------------------

interface SlideInProps {
  direction: 'left' | 'right';
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function SlideIn({
  direction,
  isOpen,
  children,
  className,
}: SlideInProps) {
  const xInitial = direction === 'left' ? '-100%' : '100%';
  const xHidden = direction === 'left' ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ x: xInitial, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: xHidden, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// 8. PulseDot
// ---------------------------------------------------------------------------

interface PulseDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

export function PulseDot({ color = 'bg-emerald-500', size = 'md' }: PulseDotProps) {
  return (
    <span className="relative inline-flex">
      <span
        className={`${sizeMap[size]} ${color} rounded-full`}
        aria-hidden="true"
      />
      <span
        className={`${sizeMap[size]} ${color} absolute inline-flex rounded-full animate-ping opacity-60`}
        aria-hidden="true"
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// 9. ShimmerText
// ---------------------------------------------------------------------------

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className }: ShimmerTextProps) {
  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className ?? ''}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, currentColor 30%, rgba(255,255,255,0.55) 50%, currentColor 70%)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['100% 0%', '-100% 0%'],
      }}
      transition={{
        duration: 2.4,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 1.6,
      }}
    >
      {children}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// 10. ScaleIn
// ---------------------------------------------------------------------------

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 260,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
