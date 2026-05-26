'use client'

import { useSession } from 'next-auth/react'
import { ExporterWizard } from './exporter-wizard'
import { AggregatorWizard } from './aggregator-wizard'
import { BuyerWizard } from './buyer-wizard'
import { StartHereFlow } from '@/components/compliance/start-here-flow'

export interface OnboardingRouterProps {
  onComplete?: () => void
  onSkip?: () => void
}

/**
 * Routes to the correct onboarding wizard based on user's entityType.
 * Falls back to the existing StartHereFlow for unmatched entity types.
 */
export function OnboardingRouter({ onComplete, onSkip }: OnboardingRouterProps) {
  const { data: session } = useSession()
  const entityType = session?.user?.entityType || ''

  // Check if onboarding was already completed
  try {
    const completed = localStorage.getItem(`terra-brew-onboarding-${entityType}`)
    if (completed === 'complete') {
      onComplete?.()
      return null
    }
  } catch {}

  switch (entityType) {
    case 'exporter':
      return <ExporterWizard onComplete={onComplete} onSkip={onSkip} />
    case 'aggregator':
      return <AggregatorWizard onComplete={onComplete} onSkip={onSkip} />
    case 'buyer':
    case 'importer':
      return <BuyerWizard onComplete={onComplete} onSkip={onSkip} />
    // Producers and other entity types use the existing generic flow
    case 'producer':
    case 'certification_body':
    case 'laboratory':
    default:
      return <StartHereFlow onComplete={onComplete} onSkip={onSkip} fullPage />
  }
}

export default OnboardingRouter
