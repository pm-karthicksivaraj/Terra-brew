'use client'

import dynamic from 'next/dynamic'

// Client-only wrapper that loads Providers with SSR disabled.
// This completely eliminates hydration mismatch because the
// SessionProvider + Toaster tree is NEVER server-rendered,
// preventing React 19 removeChild errors.
const Providers = dynamic(
  () => import('@/components/providers').then((m) => m.Providers),
  { ssr: false }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
