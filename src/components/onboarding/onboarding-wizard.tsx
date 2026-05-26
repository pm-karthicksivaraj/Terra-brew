'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { EntityType } from '@/lib/module-config'
import type { OnboardingData, StepDef } from './types'

// Step components
import { OrganizationStep } from './steps/organization-step'
import { ProducerStep } from './steps/producer-step'
import { AggregatorStep } from './steps/aggregator-step'
import { ExporterStep } from './steps/exporter-step'
import { ImporterStep } from './steps/importer-step'
import { CertificationStep } from './steps/certification-step'
import { LaboratoryStep } from './steps/laboratory-step'
import { ComplianceStep } from './steps/compliance-step'
import { CompletionStep } from './steps/completion-step'

// Default data for each section
const defaultOrganization = {
  legalName: '',
  taxId: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  phone: '',
  website: '',
}

const defaultProducer = {
  farmName: '',
  farmSize: '',
  altitude: '',
  coffeeVarieties: '',
  processingMethods: '',
  certifications: [],
  firstFarmerName: '',
  firstFarmerPhone: '',
  firstFarmerVillage: '',
}

const defaultAggregator = {
  processingCapacity: '',
  processingMethods: [],
  collectionCentreCount: '',
  mainCollectionCentreName: '',
  mainCollectionCentreAddress: '',
  certifications: [],
}

const defaultExporter = {
  exportLicenseNumber: '',
  licenseExpiryDate: '',
  destinationCountries: [],
  annualExportVolume: '',
  primaryCoffeeTypes: [],
  portOfExport: '',
}

const defaultImporter = {
  eoriNumber: '',
  importVolumeAnnual: '',
  sourceCountries: [],
  complianceNeeds: [],
  warehouseLocations: '',
  distributionRegions: [],
}

const defaultCertificationBody = {
  accreditationBody: '',
  accreditationNumber: '',
  accreditationExpiry: '',
  certificationStandards: [],
  inspectorCount: '',
  geographicCoverage: [],
}

const defaultLaboratory = {
  labAccreditation: '',
  accreditationNumber: '',
  accreditationExpiry: '',
  testCapabilities: [],
  equipmentTypes: [],
  sampleCapacity: '',
}

const defaultCompliance = {
  exportsToEU: false,
  eudrAware: false,
  hasDueDiligenceProcess: false,
  hasGeolocationData: false,
  deforestationRiskAssessed: false,
  traceabilitySystemInPlace: false,
  complianceDeadline: '',
  needsHelp: false,
}

function getStepsForEntityType(entityType: EntityType): StepDef[] {
  const commonSteps: StepDef[] = [
    {
      id: 'organization',
      title: 'Organization Details',
      description: 'Basic information about your organization',
    },
  ]

  const entityStepMap: Record<EntityType, StepDef> = {
    producer: {
      id: 'producer',
      title: 'Farm Details',
      description: 'Your farm operations and first farmer',
      entityType: 'producer',
    },
    aggregator: {
      id: 'aggregator',
      title: 'Processing & Collection',
      description: 'Processing capabilities and collection centres',
      entityType: 'aggregator',
    },
    exporter: {
      id: 'exporter',
      title: 'Export Details',
      description: 'Export licenses and destination countries',
      entityType: 'exporter',
    },
    importer: {
      id: 'importer',
      title: 'Import Details',
      description: 'EU registration and import information',
      entityType: 'importer',
    },
    certification_body: {
      id: 'certificationBody',
      title: 'Accreditation Details',
      description: 'Certification standards and coverage',
      entityType: 'certification_body',
    },
    laboratory: {
      id: 'laboratory',
      title: 'Lab Details',
      description: 'Accreditation and test capabilities',
      entityType: 'laboratory',
    },
  }

  const allSteps: StepDef[] = [
    ...commonSteps,
    entityStepMap[entityType],
    {
      id: 'compliance',
      title: 'EUDR Readiness',
      description: 'Assess your EU compliance readiness',
      entityType: 'all',
    },
    {
      id: 'completion',
      title: 'Complete',
      description: 'Review and finish setup',
      entityType: 'all',
    },
  ]

  return allSteps
}

interface OnboardingWizardProps {
  entityType: EntityType
  tenantName: string
  userName: string
}

export function OnboardingWizard({ entityType, tenantName, userName }: OnboardingWizardProps) {
  const router = useRouter()
  const steps = getStepsForEntityType(entityType)
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    organization: defaultOrganization,
    entityType,
    producer: defaultProducer,
    aggregator: defaultAggregator,
    exporter: defaultExporter,
    importer: defaultImporter,
    certificationBody: defaultCertificationBody,
    laboratory: defaultLaboratory,
    compliance: defaultCompliance,
  })

  const updateOrgData = useCallback((partial: Partial<typeof data.organization>) => {
    setData((prev) => ({ ...prev, organization: { ...prev.organization, ...partial } }))
  }, [])

  const updateProducerData = useCallback((partial: Partial<typeof data.producer>) => {
    setData((prev) => ({ ...prev, producer: { ...prev.producer, ...partial } }))
  }, [])

  const updateAggregatorData = useCallback((partial: Partial<typeof data.aggregator>) => {
    setData((prev) => ({ ...prev, aggregator: { ...prev.aggregator, ...partial } }))
  }, [])

  const updateExporterData = useCallback((partial: Partial<typeof data.exporter>) => {
    setData((prev) => ({ ...prev, exporter: { ...prev.exporter, ...partial } }))
  }, [])

  const updateImporterData = useCallback((partial: Partial<typeof data.importer>) => {
    setData((prev) => ({ ...prev, importer: { ...prev.importer, ...partial } }))
  }, [])

  const updateCertBodyData = useCallback((partial: Partial<typeof data.certificationBody>) => {
    setData((prev) => ({ ...prev, certificationBody: { ...prev.certificationBody, ...partial } }))
  }, [])

  const updateLaboratoryData = useCallback((partial: Partial<typeof data.laboratory>) => {
    setData((prev) => ({ ...prev, laboratory: { ...prev.laboratory, ...partial } }))
  }, [])

  const updateComplianceData = useCallback((partial: Partial<typeof data.compliance>) => {
    setData((prev) => ({ ...prev, compliance: { ...prev.compliance, ...partial } }))
  }, [])

  const progressPercent = ((currentStep + 1) / steps.length) * 100

  const canGoNext = () => {
    // Basic validation — on the completion step, always allow
    if (currentStep === steps.length - 1) return true
    // For step 0 (organization), require legalName at minimum
    if (currentStep === 0) return data.organization.legalName.trim() !== ''
    return true // Allow forward navigation for other steps
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!result.success) {
        toast.error(result.error || 'Failed to complete onboarding')
        return
      }

      toast.success('Onboarding complete! Welcome to Terra Brew.')

      // Force a full page reload to /dashboard so the JWT gets refreshed
      // The middleware will see the new cookie and allow access
      window.location.href = '/dashboard'
    } catch {
      toast.error('Failed to complete onboarding. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    const stepId = steps[currentStep]?.id

    switch (stepId) {
      case 'organization':
        return <OrganizationStep data={data.organization} onChange={updateOrgData} />
      case 'producer':
        return <ProducerStep data={data.producer} onChange={updateProducerData} />
      case 'aggregator':
        return <AggregatorStep data={data.aggregator} onChange={updateAggregatorData} />
      case 'exporter':
        return <ExporterStep data={data.exporter} onChange={updateExporterData} />
      case 'importer':
        return <ImporterStep data={data.importer} onChange={updateImporterData} />
      case 'certificationBody':
        return <CertificationStep data={data.certificationBody} onChange={updateCertBodyData} />
      case 'laboratory':
        return <LaboratoryStep data={data.laboratory} onChange={updateLaboratoryData} />
      case 'compliance':
        return <ComplianceStep data={data.compliance} onChange={updateComplianceData} />
      case 'completion':
        return <CompletionStep data={data} onGoToDashboard={handleComplete} loading={submitting} />
      default:
        return null
    }
  }

  const isCompletionStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-cream-50">
      {/* Header */}
      <header className="border-b border-coffee-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-sm">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-coffee-900">Terra Brew</h1>
              <p className="text-xs text-coffee-500">Setup Wizard</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-coffee-800">{tenantName}</p>
            <p className="text-xs text-coffee-400">{userName}</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/50 border-b border-coffee-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-coffee-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-coffee-500">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-coffee-100" />
          <div className="flex items-center justify-between mt-3">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  idx === currentStep
                    ? 'text-coffee-800 font-medium'
                    : idx < currentStep
                      ? 'text-coffee-600 cursor-pointer hover:text-coffee-800'
                      : 'text-coffee-300'
                }`}
                disabled={idx > currentStep}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    idx === currentStep
                      ? 'bg-coffee-600 text-white'
                      : idx < currentStep
                        ? 'bg-coffee-300 text-white'
                        : 'bg-coffee-100 text-coffee-300'
                  }`}
                >
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className="hidden md:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step Title */}
        {!isCompletionStep && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-coffee-900">
              {steps[currentStep]?.title}
            </h2>
            <p className="text-sm text-coffee-500 mt-1">
              {steps[currentStep]?.description}
            </p>
          </div>
        )}

        {/* Step Content */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {renderStep()}
        </div>

        {/* Navigation Buttons (hidden on completion step — it has its own) */}
        {!isCompletionStep && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-coffee-100">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-coffee-200 text-coffee-700 hover:bg-coffee-50 hover:text-coffee-900 rounded-xl h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white h-11 px-6 rounded-xl shadow-lg shadow-coffee-400/20 transition-all duration-300 hover:shadow-xl"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-coffee-100 bg-white/30 py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-coffee-400">
            &copy; 2024 Terra Brew &mdash; Coffee Traceability & EUDR Compliance Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
