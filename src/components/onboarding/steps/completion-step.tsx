'use client'

import { CheckCircle2, Coffee, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { OnboardingData } from '../types'
import { getEntityTypeLabel, getEntityTypeIcon } from '@/lib/module-config'

interface CompletionStepProps {
  data: OnboardingData
  onGoToDashboard: () => void
  loading: boolean
}

export function CompletionStep({ data, onGoToDashboard, loading }: CompletionStepProps) {
  const entityTypeIcon = getEntityTypeIcon(data.entityType)
  const entityTypeLabel = getEntityTypeLabel(data.entityType)

  const summaryItems = [
    {
      label: 'Organization',
      value: data.organization.legalName || 'Not provided',
      detail: [data.organization.city, data.organization.country].filter(Boolean).join(', ') || 'No location',
    },
    {
      label: 'Entity Type',
      value: `${entityTypeIcon} ${entityTypeLabel}`,
      detail: '',
    },
  ]

  // Add entity-specific summary
  if (data.entityType === 'producer' && data.producer.farmName) {
    summaryItems.push({
      label: 'Farm',
      value: data.producer.farmName,
      detail: data.producer.coffeeVarieties || '',
    })
  }
  if (data.entityType === 'exporter' && data.exporter.exportLicenseNumber) {
    summaryItems.push({
      label: 'Export License',
      value: data.exporter.exportLicenseNumber,
      detail: data.exporter.destinationCountries.length > 0
        ? `Destinations: ${data.exporter.destinationCountries.join(', ')}`
        : '',
    })
  }
  if (data.entityType === 'importer' && data.importer.eoriNumber) {
    summaryItems.push({
      label: 'EORI Number',
      value: data.importer.eoriNumber,
      detail: data.importer.sourceCountries.length > 0
        ? `Sources: ${data.importer.sourceCountries.join(', ')}`
        : '',
    })
  }

  // Compliance summary
  const complianceReady = data.compliance.exportsToEU && data.compliance.hasDueDiligenceProcess && data.compliance.hasGeolocationData
  const compliancePartial = data.compliance.exportsToEU && (data.compliance.hasDueDiligenceProcess || data.compliance.hasGeolocationData)

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 mb-4"
          style={{ animation: 'loginScaleIn 0.5s ease-out both' }}
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-coffee-900 mb-2">You&apos;re All Set!</h2>
        <p className="text-coffee-500 text-sm max-w-md mx-auto">
          Your Terra Brew account has been configured. Here&apos;s a summary of what you&apos;ve set up.
        </p>
      </div>

      {/* Summary Cards */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-coffee-900 text-base">Setup Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between p-3 rounded-lg bg-coffee-50/40 border border-coffee-100"
            >
              <div>
                <p className="text-xs text-coffee-500 font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-sm text-coffee-900 font-medium mt-0.5">{item.value}</p>
                {item.detail && (
                  <p className="text-xs text-coffee-400 mt-0.5">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-coffee-900 text-base">EUDR Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-coffee-50/40 border border-coffee-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              complianceReady
                ? 'bg-green-100'
                : compliancePartial
                  ? 'bg-amber-100'
                  : 'bg-coffee-100'
            }`}>
              <CheckCircle2 className={`w-5 h-5 ${
                complianceReady
                  ? 'text-green-600'
                  : compliancePartial
                    ? 'text-amber-600'
                    : 'text-coffee-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    complianceReady
                      ? 'border-green-300 text-green-700 bg-green-50'
                      : compliancePartial
                        ? 'border-amber-300 text-amber-700 bg-amber-50'
                        : 'border-coffee-300 text-coffee-600 bg-coffee-50'
                  }`}
                >
                  {complianceReady ? 'Ready' : compliancePartial ? 'In Progress' : 'Getting Started'}
                </Badge>
              </div>
              <p className="text-xs text-coffee-500 mt-1">
                {complianceReady
                  ? 'You have the key elements in place for EUDR compliance.'
                  : compliancePartial
                    ? 'Some compliance elements are in place. We\'ll help you complete the rest.'
                    : 'We\'ll guide you through setting up EUDR compliance from scratch.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Go to Dashboard */}
      <div className="text-center pt-2">
        <Button
          onClick={onGoToDashboard}
          disabled={loading}
          className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white h-12 px-8 rounded-xl shadow-lg shadow-coffee-400/20 transition-all duration-300 hover:shadow-xl text-sm font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up your dashboard...
            </>
          ) : (
            <>
              <Coffee className="w-4 h-4 mr-2" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        <p className="text-coffee-400 text-xs mt-3">
          You can update these details anytime from your account settings.
        </p>
      </div>
    </div>
  )
}
