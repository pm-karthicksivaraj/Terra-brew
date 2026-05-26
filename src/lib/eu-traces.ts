/**
 * EU TRACES / Information System Integration Library
 * 
 * Implements the EU Information System (IS) integration for Due Diligence
 * Statement (DDS) submission as required by the EUDR (EU Deforestation
 * Regulation 2023/1115).
 * 
 * This module handles:
 * - DDS submission to the EU Information System
 * - Reference number retrieval
 * - Status checking
 * - Amendment and withdrawal operations
 * - Error handling for EU IS responses
 * 
 * @see https://environment.ec.europa.eu/topics/deforestation/regulation-eu-20231115_en
 * @see https://ec.europa.eu/environment/forests/eudr.htm
 */

// ════════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════════

const EU_IS_BASE_URL = process.env.EU_IS_BASE_URL || 'https://is.eudr.ec.europa.eu/api/v1'
const EU_IS_API_KEY = process.env.EU_IS_API_KEY || ''
const EU_IS_CERT_PATH = process.env.EU_IS_CERT_PATH || '' // Path to client certificate

// ════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════

export interface DDSOperator {
  /** Operator reference number assigned by the EU */
  operatorReferenceNumber: string
  /** Legal name of the operator */
  name: string
  /** Operator type: "natural_person" | "legal_entity" */
  type: 'natural_person' | 'legal_entity'
  /** Country code (ISO 3166-1 alpha-2) */
  country: string
  /** Address of the operator */
  address: string
  /** Email contact */
  email: string
  /** Phone contact */
  phone?: string
  /** VAT/tax ID */
  taxId?: string
}

export interface DDSPlotOfLand {
  /** Unique plot identifier */
  plotId: string
  /** Country code where plot is located */
  countryCode: string
  /** GPS coordinates — GeoJSON polygon or point */
  geojson: {
    type: 'Polygon' | 'Point'
    coordinates: number[][] | number[]
  }
  /** Area in hectares */
  areaHa: number
  /** Production date range start */
  productionStart: string
  /** Production date range end */
  productionEnd: string
}

export interface DDSCommodity {
  /** Commodity type as per EUDR classification */
  commodityType: 'coffee' | 'cocoa' | 'palm_oil' | 'soy' | 'wood' | 'rubber' | 'cattle' | 'charcoal' | 'printed_paper'
  /** HS code(s) applicable */
  hsCodes: string[]
  /** Country of production */
  countryOfProduction: string
  /** Total weight in kg */
  weightKg: number
  /** Quantity and unit description */
  quantityDescription: string
}

export interface DDSSubmissionParams {
  /** Operator submitting the DDS */
  operator: DDSOperator
  /** Plots of land where commodities were produced */
  plotsOfLand: DDSPlotOfLand[]
  /** Commodities covered by this DDS */
  commodities: DDSCommodity[]
  /** Whether the operator is an SME (Small/Medium Enterprise) */
  isSME: boolean
  /** Risk assessment result */
  riskAssessment: {
    method: 'satellite' | 'third_party' | 'self_assessment' | 'country_benchmark'
    result: 'no_risk' | 'low_risk' | 'standard_risk' | 'high_risk'
    details?: string
  }
  /** Additional remarks */
  remarks?: string
  /** Intended country(ies) of placement on EU market */
  destinationCountries: string[]
}

export interface DDSSubmissionResponse {
  /** EU IS reference number for this DDS */
  referenceNumber: string
  /** Submission status */
  status: 'submitted' | 'acknowledged' | 'under_review'
  /** Timestamp of submission */
  submittedAt: string
  /** Any validation warnings */
  warnings: DDSDValidationError[]
}

export interface DDSStatusResponse {
  /** Reference number */
  referenceNumber: string
  /** Current status */
  status: 'submitted' | 'acknowledged' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  /** Status history */
  statusHistory: Array<{
    status: string
    timestamp: string
    comment?: string
  }>
  /** Any validation errors */
  errors: DDSDValidationError[]
  /** Approval date if approved */
  approvedAt?: string
  /** Expiry date */
  expiryDate?: string
}

export interface DDSAmendmentParams {
  /** Reference number of the DDS to amend */
  referenceNumber: string
  /** Reason for amendment */
  reason: string
  /** Updated fields */
  updates: Partial<DDSSubmissionParams>
}

export interface DDSDValidationError {
  /** Error code */
  code: string
  /** Field that caused the error */
  field: string
  /** Error message */
  message: string
  /** Severity: "error" | "warning" */
  severity: 'error' | 'warning'
}

// ════════════════════════════════════════════════════════════════
// API Client
// ════════════════════════════════════════════════════════════════

/**
 * Makes an authenticated request to the EU Information System API.
 */
async function euIsRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': EU_IS_API_KEY,
    ...(options.headers as Record<string, string> || {}),
  }

  // If client certificate is configured, note that in production
  // this would use mutual TLS (mTLS) with the client cert
  if (EU_IS_CERT_PATH) {
    headers['X-Client-Cert-Path'] = EU_IS_CERT_PATH
  }

  const response = await fetch(`${EU_IS_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  return response
}

/**
 * Handles EU IS API error responses with structured error parsing.
 */
function parseEUISError(status: number, body: string): Error {
  try {
    const errorData = JSON.parse(body)
    const errors = errorData.errors || errorData.error || []
    if (Array.isArray(errors) && errors.length > 0) {
      const messages = errors.map((e: DDSDValidationError) => `${e.field}: ${e.message}`).join('; ')
      return new Error(`EU IS Error (${status}): ${messages}`)
    }
    return new Error(`EU IS Error (${status}): ${errorData.message || body}`)
  } catch {
    return new Error(`EU IS Error (${status}): ${body}`)
  }
}

// ════════════════════════════════════════════════════════════════
// DDS Submission
// ════════════════════════════════════════════════════════════════

/**
 * Submits a Due Diligence Statement (DDS) to the EU Information System.
 * 
 * @example
 * ```ts
 * const result = await submitDDS({
 *   operator: {
 *     operatorReferenceNumber: 'EUDR-DE-2025-00001',
 *     name: 'Terra Brew GmbH',
 *     type: 'legal_entity',
 *     country: 'DE',
 *     address: 'Hauptstraße 1, 10115 Berlin, Germany',
 *     email: 'compliance@terrabrew.com',
 *   },
 *   plotsOfLand: [{
 *     plotId: 'PLOT-VN-001',
 *     countryCode: 'VN',
 *     geojson: { type: 'Polygon', coordinates: [[[107.5, 12.5], [107.6, 12.5], [107.6, 12.6], [107.5, 12.6], [107.5, 12.5]]] },
 *     areaHa: 2.5,
 *     productionStart: '2024-10-01',
 *     productionEnd: '2025-01-31',
 *   }],
 *   commodities: [{
 *     commodityType: 'coffee',
 *     hsCodes: ['0901'],
 *     countryOfProduction: 'VN',
 *     weightKg: 10000,
 *     quantityDescription: '10,000 kg green coffee beans',
 *   }],
 *   isSME: false,
 *   riskAssessment: {
 *     method: 'satellite',
 *     result: 'low_risk',
 *   },
 *   destinationCountries: ['DE'],
 * })
 * ```
 */
export async function submitDDS(params: DDSSubmissionParams): Promise<DDSSubmissionResponse> {
  const response = await euIsRequest('/due-diligence-statements', {
    method: 'POST',
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }

  return response.json()
}

// ════════════════════════════════════════════════════════════════
// Reference Number Retrieval
// ════════════════════════════════════════════════════════════════

/**
 * Retrieves the reference number for a submitted DDS.
 * 
 * After submission, the EU IS assigns a unique reference number.
 * This can be used to track the DDS status and is required for
 * customs declarations.
 */
export async function getReferenceNumber(submissionId: string): Promise<string> {
  const response = await euIsRequest(`/due-diligence-statements/${submissionId}/reference-number`, {
    method: 'GET',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }

  const data = await response.json()
  return data.referenceNumber
}

// ════════════════════════════════════════════════════════════════
// Status Checking
// ════════════════════════════════════════════════════════════════

/**
 * Checks the status of a submitted DDS.
 * 
 * @param referenceNumber - The EU IS reference number
 * @returns Detailed status information including history and any errors
 */
export async function getDDSStatus(referenceNumber: string): Promise<DDSStatusResponse> {
  const response = await euIsRequest(`/due-diligence-statements/${referenceNumber}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }

  return response.json()
}

/**
 * Lists all DDS submissions for an operator.
 * 
 * @param operatorReferenceNumber - The operator's reference number
 * @param params - Pagination and filter parameters
 */
export async function listDDSSubmissions(
  operatorReferenceNumber: string,
  params?: {
    page?: number
    pageSize?: number
    status?: string
    fromDate?: string
    toDate?: string
  },
): Promise<{
  data: DDSStatusResponse[]
  total: number
  page: number
  pageSize: number
}> {
  const searchParams = new URLSearchParams()
  searchParams.set('operatorRef', operatorReferenceNumber)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params?.status) searchParams.set('status', params.status)
  if (params?.fromDate) searchParams.set('fromDate', params.fromDate)
  if (params?.toDate) searchParams.set('toDate', params.toDate)

  const response = await euIsRequest(`/due-diligence-statements?${searchParams.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }

  return response.json()
}

// ════════════════════════════════════════════════════════════════
// Amendment & Withdrawal
// ════════════════════════════════════════════════════════════════

/**
 * Amends an existing DDS.
 * 
 * Operators can amend a DDS to correct errors or update information.
 * The amendment must include a reason for the change.
 */
export async function amendDDS(params: DDSAmendmentParams): Promise<DDSSubmissionResponse> {
  const response = await euIsRequest(`/due-diligence-statements/${params.referenceNumber}/amend`, {
    method: 'PUT',
    body: JSON.stringify({
      reason: params.reason,
      ...params.updates,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }

  return response.json()
}

/**
 * Withdraws a previously submitted DDS.
 * 
 * @param referenceNumber - The EU IS reference number
 * @param reason - Reason for withdrawal
 */
export async function withdrawDDS(referenceNumber: string, reason: string): Promise<void> {
  const response = await euIsRequest(`/due-diligence-statements/${referenceNumber}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw parseEUISError(response.status, errorBody)
  }
}

// ════════════════════════════════════════════════════════════════
// Validation Helpers
// ════════════════════════════════════════════════════════════════

/**
 * Validates a DDS submission payload before sending to the EU IS.
 * Returns an array of validation errors (empty if valid).
 */
export function validateDDSSubmission(params: DDSSubmissionParams): DDSDValidationError[] {
  const errors: DDSDValidationError[] = []

  // Operator validation
  if (!params.operator.operatorReferenceNumber) {
    errors.push({ code: 'MISSING_FIELD', field: 'operator.operatorReferenceNumber', message: 'Operator reference number is required', severity: 'error' })
  }
  if (!params.operator.name) {
    errors.push({ code: 'MISSING_FIELD', field: 'operator.name', message: 'Operator name is required', severity: 'error' })
  }
  if (!params.operator.country || params.operator.country.length !== 2) {
    errors.push({ code: 'INVALID_FIELD', field: 'operator.country', message: 'Valid ISO 3166-1 alpha-2 country code is required', severity: 'error' })
  }
  if (!params.operator.email) {
    errors.push({ code: 'MISSING_FIELD', field: 'operator.email', message: 'Operator email is required', severity: 'error' })
  }

  // Plots of land validation
  if (!params.plotsOfLand || params.plotsOfLand.length === 0) {
    errors.push({ code: 'MISSING_FIELD', field: 'plotsOfLand', message: 'At least one plot of land is required', severity: 'error' })
  } else {
    params.plotsOfLand.forEach((plot, idx) => {
      if (!plot.plotId) {
        errors.push({ code: 'MISSING_FIELD', field: `plotsOfLand[${idx}].plotId`, message: 'Plot ID is required', severity: 'error' })
      }
      if (!plot.countryCode || plot.countryCode.length !== 2) {
        errors.push({ code: 'INVALID_FIELD', field: `plotsOfLand[${idx}].countryCode`, message: 'Valid country code is required', severity: 'error' })
      }
      if (!plot.geojson) {
        errors.push({ code: 'MISSING_FIELD', field: `plotsOfLand[${idx}].geojson`, message: 'GeoJSON geometry is required', severity: 'error' })
      }
      if (!plot.areaHa || plot.areaHa <= 0) {
        errors.push({ code: 'INVALID_FIELD', field: `plotsOfLand[${idx}].areaHa`, message: 'Area must be positive', severity: 'error' })
      }
    })
  }

  // Commodities validation
  if (!params.commodities || params.commodities.length === 0) {
    errors.push({ code: 'MISSING_FIELD', field: 'commodities', message: 'At least one commodity is required', severity: 'error' })
  } else {
    const validCommodityTypes = ['coffee', 'cocoa', 'palm_oil', 'soy', 'wood', 'rubber', 'cattle', 'charcoal', 'printed_paper']
    params.commodities.forEach((commodity, idx) => {
      if (!validCommodityTypes.includes(commodity.commodityType)) {
        errors.push({ code: 'INVALID_FIELD', field: `commodities[${idx}].commodityType`, message: `Must be one of: ${validCommodityTypes.join(', ')}`, severity: 'error' })
      }
      if (!commodity.weightKg || commodity.weightKg <= 0) {
        errors.push({ code: 'INVALID_FIELD', field: `commodities[${idx}].weightKg`, message: 'Weight must be positive', severity: 'error' })
      }
    })
  }

  // Risk assessment validation
  if (!params.riskAssessment) {
    errors.push({ code: 'MISSING_FIELD', field: 'riskAssessment', message: 'Risk assessment is required', severity: 'error' })
  }

  // Destination countries
  if (!params.destinationCountries || params.destinationCountries.length === 0) {
    errors.push({ code: 'MISSING_FIELD', field: 'destinationCountries', message: 'At least one destination EU country is required', severity: 'error' })
  }

  return errors
}

/**
 * Generates a local reference number for a DDS submission following
 * the EUDR format: EUDR-{COUNTRY}-{YEAR}-{SEQUENCE}
 */
export function generateLocalReferenceNumber(countryCode: string, sequence: number): string {
  const year = new Date().getFullYear()
  return `EUDR-${countryCode.toUpperCase()}-${year}-${String(sequence).padStart(4, '0')}`
}

/**
 * Maps an EU IS DDS status to our internal EudrCompliance status.
 */
export function mapEUIsStatusToInternal(euStatus: string): string {
  switch (euStatus) {
    case 'submitted':
    case 'acknowledged':
      return 'submitted'
    case 'under_review':
      return 'submitted'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'withdrawn':
      return 'expired'
    default:
      return 'draft'
  }
}
