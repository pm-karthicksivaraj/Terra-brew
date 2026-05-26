import type { EntityType } from '@/lib/module-config'

// ─── Onboarding Data Shape ───────────────────────────────────────

export interface OrganizationData {
  legalName: string
  taxId: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  website: string
}

export interface ProducerData {
  farmName: string
  farmSize: string
  altitude: string
  coffeeVarieties: string
  processingMethods: string
  certifications: string[]
  firstFarmerName: string
  firstFarmerPhone: string
  firstFarmerVillage: string
}

export interface AggregatorData {
  processingCapacity: string
  processingMethods: string[]
  collectionCentreCount: string
  mainCollectionCentreName: string
  mainCollectionCentreAddress: string
  certifications: string[]
}

export interface ExporterData {
  exportLicenseNumber: string
  licenseExpiryDate: string
  destinationCountries: string[]
  annualExportVolume: string
  primaryCoffeeTypes: string[]
  portOfExport: string
}

export interface ImporterData {
  eoriNumber: string
  importVolumeAnnual: string
  sourceCountries: string[]
  complianceNeeds: string[]
  warehouseLocations: string
  distributionRegions: string[]
}

export interface CertificationBodyData {
  accreditationBody: string
  accreditationNumber: string
  accreditationExpiry: string
  certificationStandards: string[]
  inspectorCount: string
  geographicCoverage: string[]
}

export interface LaboratoryData {
  labAccreditation: string
  accreditationNumber: string
  accreditationExpiry: string
  testCapabilities: string[]
  equipmentTypes: string[]
  sampleCapacity: string
}

export interface ComplianceData {
  exportsToEU: boolean
  eudrAware: boolean
  hasDueDiligenceProcess: boolean
  hasGeolocationData: boolean
  deforestationRiskAssessed: boolean
  traceabilitySystemInPlace: boolean
  complianceDeadline: string
  needsHelp: boolean
}

export interface OnboardingData {
  organization: OrganizationData
  entityType: EntityType
  producer: ProducerData
  aggregator: AggregatorData
  exporter: ExporterData
  importer: ImporterData
  certificationBody: CertificationBodyData
  laboratory: LaboratoryData
  compliance: ComplianceData
}

// ─── Step Definition ─────────────────────────────────────────────

export interface StepDef {
  id: string
  title: string
  description: string
  entityType?: EntityType | 'all'  // which entity types see this step
}

// ─── Step Component Props ────────────────────────────────────────

export interface StepProps<T> {
  data: T
  onChange: (data: Partial<T>) => void
}
