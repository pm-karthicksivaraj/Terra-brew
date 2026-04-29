'use client'

import { useState, useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, useTheme } from 'next-themes'
import dynamic from 'next/dynamic'

// Load Toaster client-only — Sonner creates a portal on document.body
// which causes React 19 removeChild hydration errors when rendered during SSR.
const ClientToaster = dynamic(
  () => import('@/components/ui/sonner').then((m) => m.Toaster),
  { ssr: false }
)

// Delayed Toaster wrapper — only renders after a short delay to ensure
// the DOM is fully hydrated and stable before Sonner attaches its portal.
// Also respects the current theme (dark/light).
function DelayedToaster() {
  const [show, setShow] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null
  return <ClientToaster richColors position="top-right" theme={resolvedTheme as 'light' | 'dark' | 'system'} />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
      <SessionProvider>
        {children}
        <DelayedToaster />
      </SessionProvider>
    </ThemeProvider>
  )
}
