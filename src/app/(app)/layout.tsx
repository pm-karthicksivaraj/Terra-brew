'use client'

import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = useSession()
  const status = sessionResult?.status ?? 'loading'

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
