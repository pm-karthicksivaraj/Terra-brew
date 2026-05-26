'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Coffee, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { EntityType } from '@/lib/module-config'

// Dynamic import to avoid SSR issues with useSession
const OnboardingWizard = dynamic(
  () => import('@/components/onboarding/onboarding-wizard').then((m) => m.OnboardingWizard),
  { ssr: false }
)

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Derive ready state from session — no setState in effect
  const ready = useMemo(() => {
    if (status === 'loading') return false
    if (status === 'unauthenticated') return false
    if (session?.user?.onboardingCompleted) return false
    if (session?.user?.isPlatformAdmin && !session?.user?.tenantId) return false
    if (!session?.user?.tenantId || !session?.user?.entityType) return false
    return true
  }, [session, status])

  // Handle redirects in a separate effect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.onboardingCompleted) {
      router.push('/dashboard')
    } else if (session?.user?.isPlatformAdmin && !session?.user?.tenantId) {
      router.push('/super-admin/dashboard')
    }
  }, [session, status, router])

  // Loading state
  if (status === 'loading' || (!ready && status !== 'unauthenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 via-white to-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mx-auto mb-4">
            <Coffee className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl font-bold text-coffee-900 mb-2">Terra Brew</h1>
          <div className="flex items-center justify-center gap-2 text-coffee-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading setup wizard...</span>
          </div>
        </div>
      </div>
    )
  }

  // Guard: if we don't have the necessary session data
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 via-white to-cream-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mx-auto mb-4">
            <Coffee className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl font-bold text-coffee-900 mb-2">Redirecting...</h1>
          <p className="text-sm text-coffee-500 mb-4">
            You&apos;re being redirected to the appropriate page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWizard
      entityType={session!.user.entityType as EntityType}
      tenantName={session!.user.tenantName || 'Your Organization'}
      userName={session!.user.name || 'User'}
    />
  )
}
