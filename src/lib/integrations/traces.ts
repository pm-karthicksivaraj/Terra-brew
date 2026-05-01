/**
 * EU TRACES Integration Module — Terra Brew Coffee Platform
 *
 * Handles Due Diligence Statement (DDS) submission, certificate status
 * checks, EU operator registration validation, and compliance requirements
 * lookup via the TRACES API.
 */

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface DueDiligenceStatementData {
  operatorName: string
  operatorEori: string
  operatorCountry: string
  commodityType: string
  commodityCode: string
  countryOfProduction: string
  regionOfProduction: string
  geoCoordinates: Array<{ lat: number; lng: number }>
  productionStartDate: string
  productionEndDate: string
  deforestationRiskAssessment: 'low' | 'medium' | 'high' | 'negligible'
  riskAssessmentProvider: string
  riskAssessmentDate: string
  traceabilityInfo: {
    farmerIds: string[]
    farmLandIds: string[]
    batchIds: string[]
  }
  additionalDocuments: Array<{
    type: string
    url: string
    description: string
  }>
}

export interface TracesSubmitResponse {
  success: boolean
  ddsReference: string
  submissionDate: string
  status: 'submitted' | 'accepted' | 'rejected' | 'pending_review'
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export interface TracesCertificateStatus {
  certificateRef: string
  status: 'valid' | 'expired' | 'revoked' | 'pending'
  issuedDate: string
  expiryDate: string
  commodityType: string
  operatorName: string
  restrictions?: string[]
}

export interface TracesRegistrationValidation {
  valid: boolean
  registrationNumber: string
  operatorName?: string
  operatorType?: string
  country?: string
  status?: 'active' | 'inactive' | 'suspended'
  message?: string
}

export interface ComplianceRequirement {
  countryCode: string
  countryName: string
  eudrApplicable: boolean
  requiredDocuments: string[]
  registrationRequired: boolean
  ddsRequired: boolean
  satelliteAssessmentRequired: boolean
  specialRequirements: string[]
  riskCategory: 'low' | 'standard' | 'high'
  referenceUrl?: string
}

// ════════════════════════════════════════════════════════════════
// API HELPERS
// ════════════════════════════════════════════════════════════════

const TRACES_API_URL = process.env.TRACES_API_URL || 'https://ec.europa.eu/food/traces/api'
const TRACES_API_KEY = process.env.TRACES_API_KEY || ''

async function tracesRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${TRACES_API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TRACES_API_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`TRACES API error (${response.status}): ${errorBody}`)
  }

  return response.json()
}

// ════════════════════════════════════════════════════════════════
// SUBMIT DUE DILIGENCE STATEMENT
// ════════════════════════════════════════════════════════════════

export async function submitDueDiligenceStatement(
  data: DueDiligenceStatementData
): Promise<TracesSubmitResponse> {
  try {
    const response = await tracesRequest<TracesSubmitResponse>('/v1/dds/submit', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        submissionTimestamp: new Date().toISOString(),
      }),
    })
    return response
  } catch (error: unknown) {
    // If API is not configured, return a simulated response
    if (!TRACES_API_KEY) {
      return {
        success: true,
        ddsReference: `DDS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        submissionDate: new Date().toISOString(),
        status: 'submitted',
        message: 'DDS submitted (simulated — TRACES API key not configured)',
      }
    }
    throw error
  }
}

// ════════════════════════════════════════════════════════════════
// GET CERTIFICATE STATUS
// ════════════════════════════════════════════════════════════════

export async function getCertificateStatus(
  certificateRef: string
): Promise<TracesCertificateStatus> {
  try {
    const response = await tracesRequest<TracesCertificateStatus>(
      `/v1/certificates/${encodeURIComponent(certificateRef)}`
    )
    return response
  } catch (error: unknown) {
    if (!TRACES_API_KEY) {
      return {
        certificateRef,
        status: 'valid',
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        commodityType: 'coffee',
        operatorName: 'Simulated Operator',
      }
    }
    throw error
  }
}

// ════════════════════════════════════════════════════════════════
// VALIDATE TRACES REGISTRATION
// ════════════════════════════════════════════════════════════════

export async function validateTracesRegistration(
  registrationNumber: string
): Promise<TracesRegistrationValidation> {
  try {
    const response = await tracesRequest<TracesRegistrationValidation>(
      `/v1/operators/validate/${encodeURIComponent(registrationNumber)}`
    )
    return response
  } catch (error: unknown) {
    if (!TRACES_API_KEY) {
      // Basic EORI format validation as fallback
      const eoriPattern = /^[A-Z]{2}\d{10,15}$/
      return {
        valid: eoriPattern.test(registrationNumber),
        registrationNumber,
        operatorName: 'Simulated Operator',
        operatorType: 'importer',
        country: registrationNumber.slice(0, 2),
        status: eoriPattern.test(registrationNumber) ? 'active' : 'inactive',
        message: 'Validation simulated — TRACES API key not configured',
      }
    }
    throw error
  }
}

// ════════════════════════════════════════════════════════════════
// GET COMPLIANCE REQUIREMENTS
// ════════════════════════════════════════════════════════════════

// Static compliance requirements database for EU member states and key trading partners
const COMPLIANCE_REQUIREMENTS: Record<string, Omit<ComplianceRequirement, 'countryCode' | 'countryName'>> = {
  DE: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: ['German Language Declaration may be required for customs'],
    riskCategory: 'standard',
    referenceUrl: 'https://www.zoll.de/eudr',
  },
  FR: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: [],
    riskCategory: 'standard',
    referenceUrl: 'https://www.douane.gouv.fr/eudr',
  },
  NL: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: ['Rotterdam port requires additional phyto inspection for coffee'],
    riskCategory: 'standard',
    referenceUrl: 'https://www.belastingdienst.nl/eudr',
  },
  IT: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: [],
    riskCategory: 'standard',
  },
  ES: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: [],
    riskCategory: 'standard',
  },
  BE: {
    eudrApplicable: true,
    requiredDocuments: ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: true,
    ddsRequired: true,
    satelliteAssessmentRequired: true,
    specialRequirements: ['Antwerp port — additional commodity checks'],
    riskCategory: 'standard',
  },
  GB: {
    eudrApplicable: false,
    requiredDocuments: ['phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: false,
    ddsRequired: false,
    satelliteAssessmentRequired: false,
    specialRequirements: ['UK has its own due diligence requirements under Environment Act 2021'],
    riskCategory: 'standard',
    referenceUrl: 'https://www.gov.uk/guidance/using-forest-risk-commodities',
  },
  US: {
    eudrApplicable: false,
    requiredDocuments: ['phytosanitary_certificate', 'certificate_of_origin', 'fda_prior_notice'],
    registrationRequired: false,
    ddsRequired: false,
    satelliteAssessmentRequired: false,
    specialRequirements: ['FDA prior notice required for food imports', 'USDA APHIS requirements for coffee'],
    riskCategory: 'low',
  },
  JP: {
    eudrApplicable: false,
    requiredDocuments: ['phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: false,
    ddsRequired: false,
    satelliteAssessmentRequired: false,
    specialRequirements: ['Japanese Food Sanitation Act compliance required'],
    riskCategory: 'low',
  },
  VN: {
    eudrApplicable: false,
    requiredDocuments: ['phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: false,
    ddsRequired: false,
    satelliteAssessmentRequired: false,
    specialRequirements: [],
    riskCategory: 'low',
  },
}

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  IT: 'Italy',
  ES: 'Spain',
  BE: 'Belgium',
  GB: 'United Kingdom',
  US: 'United States',
  JP: 'Japan',
  VN: 'Vietnam',
  AT: 'Austria',
  PL: 'Poland',
  PT: 'Portugal',
  SE: 'Sweden',
  DK: 'Denmark',
  FI: 'Finland',
  IE: 'Ireland',
  CZ: 'Czech Republic',
  RO: 'Romania',
  HU: 'Hungary',
  GR: 'Greece',
}

export async function getComplianceRequirements(
  countryCode: string
): Promise<ComplianceRequirement> {
  const code = countryCode.toUpperCase()

  // Try the TRACES API first
  if (TRACES_API_KEY) {
    try {
      const response = await tracesRequest<ComplianceRequirement>(
        `/v1/compliance/requirements/${encodeURIComponent(code)}`
      )
      return response
    } catch {
      // Fall through to static data
    }
  }

  // Use static compliance requirements
  const staticData = COMPLIANCE_REQUIREMENTS[code]
  const countryName = COUNTRY_NAMES[code] || code

  if (staticData) {
    return {
      countryCode: code,
      countryName,
      ...staticData,
    }
  }

  // EU member states not in our static list still need EUDR compliance
  const euMemberStates = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ])

  const isEU = euMemberStates.has(code)

  return {
    countryCode: code,
    countryName,
    eudrApplicable: isEU,
    requiredDocuments: isEU
      ? ['due_diligence_statement', 'phytosanitary_certificate', 'certificate_of_origin']
      : ['phytosanitary_certificate', 'certificate_of_origin'],
    registrationRequired: isEU,
    ddsRequired: isEU,
    satelliteAssessmentRequired: isEU,
    specialRequirements: isEU
      ? ['EUDR compliance required for EU import']
      : [],
    riskCategory: isEU ? 'standard' : 'low',
  }
}
