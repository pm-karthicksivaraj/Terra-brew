'use client'

import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'

// Load Toaster client-only — Sonner creates a portal on document.body
// which causes React 19 removeChild hydration errors when rendered during SSR.
const ClientToaster = dynamic(
  () => import('@/components/ui/sonner').then((m) => m.Toaster),
  { ssr: false }
)

// NO ThemeProvider — removed to prevent next-themes hydration mismatch.
// The app uses a single light theme via CSS variables.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ClientToaster richColors position="top-right" />
    </SessionProvider>
  )
}
