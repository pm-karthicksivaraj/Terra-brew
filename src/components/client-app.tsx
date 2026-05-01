'use client'

import { useState, useEffect } from 'react'
import { Providers } from '@/components/providers'

/**
 * ClientApp — Nuclear fix for React 19 removeChild hydration errors.
 *
 * Renders a loading spinner during SSR and initial hydration,
 * then wraps children in Providers (ThemeProvider + SessionProvider + Toaster)
 * only after the component is mounted in the browser.
 *
 * This eliminates ALL server/client DOM mismatches because
 * there is NO server-rendered app content to mismatch with.
 * For a dashboard app behind a login wall, SSR is useless anyway.
 */
export function ClientApp({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          color: '#0D9488',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>☕</div>
          <div>Loading Terra Brew...</div>
        </div>
      </div>
    )
  }

  return <Providers>{children}</Providers>
}
