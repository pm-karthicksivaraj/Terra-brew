'use client'

import { useState, useEffect } from 'react'
import { Providers } from '@/components/providers'

/**
 * ClientApp — Nuclear fix for React 19 removeChild hydration errors.
 *
 * Renders a loading spinner during SSR and initial hydration,
 * then wraps children in Providers (SessionProvider + Toaster)
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
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: '"Space Mono", monospace',
          color: '#6B4226',
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
