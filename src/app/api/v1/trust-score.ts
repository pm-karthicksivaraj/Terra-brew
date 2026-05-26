/**
 * Trust Score Calculation Module
 *
 * Reusable, deterministic Trust Score computation for the TerraBrew Coffee Platform.
 * The Trust Score (0–100) is a composite score calculated from five components:
 *
 *   1. EUDR Compliance Status   (max 30 pts)
 *   2. Deforestation Risk        (max 25 pts)
 *   3. DDS Status                (max 20 pts)
 *   4. Certifications            (max 15 pts)
 *   5. Data Completeness         (max 10 pts)
 *
 * Same inputs always produce the same score.
 * This module can be imported by API routes, server actions, or background jobs.
 */

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface TrustScoreInput {
  /** EUDR compliance statuses from all compliance records for the tenant */
  eudrStatuses: string[]
  /** Risk categories from all deforestation assessments for the tenant */
  deforestationRiskCategories: string[]
  /** DDS statuses from all due diligence statements for the tenant */
  ddsStatuses: string[]
  /** Number of currently active (non-expired) certifications */
  certActiveCount: number
  /** Number of expired certifications */
  certExpiredCount: number
  /** Total number of certification records */
  certTotalCount: number
  /** At least one farmland has latitude/longitude or geo-center coordinates */
  hasGeolocation: boolean
  /** At least one farmland has a polygonGeoJson boundary */
  hasFarmPolygon: boolean
  /** At least one farmer record exists for the tenant */
  hasFarmerData: boolean
}

export interface TrustScoreBreakdown {
  /** Overall trust score (0–100) */
  total: number
  /** EUDR compliance component score (0–30) */
  eudr: number
  /** Deforestation risk component score (0–25) */
  deforestation: number
  /** DDS status component score (0–20) */
  dds: number
  /** Certifications component score (0–15) */
  certifications: number
  /** Data completeness component score (0–10) */
  dataCompleteness: number
}

// ════════════════════════════════════════════════════════════════
// COMPONENT SCORE CALCULATORS
// ════════════════════════════════════════════════════════════════

/**
 * Calculate the EUDR compliance component score (0–30).
 *
 * Scoring:
 *   compliant   = 30
 *   in_review   = 20
 *   pending     = 10
 *   expired     = 5
 *   non_compliant = 0
 *
 * When no records exist, defaults to "pending" (= 10 pts).
 * Takes the BEST score among all compliance records.
 */
export function calcEudrScore(statuses: string[]): number {
  if (statuses.length === 0) return 10 // default "pending" when no records

  const statusPriority: Record<string, number> = {
    compliant: 30,
    in_review: 20,
    pending: 10,
    expired: 5,
    non_compliant: 0,
  }

  let bestScore = 0
  for (const status of statuses) {
    const score = statusPriority[status] ?? 0
    if (score > bestScore) bestScore = score
  }
  return bestScore
}

/**
 * Calculate the deforestation risk component score (0–25).
 *
 * Scoring:
 *   negligible = 25
 *   low        = 20
 *   medium     = 10
 *   high       = 0
 *   critical   = 0
 *
 * When no assessments exist, defaults to a minimal score of 5.
 * Takes the BEST (lowest risk) score among all assessments.
 */
export function calcDeforestationScore(riskCategories: string[]): number {
  if (riskCategories.length === 0) return 5 // minimal score when no assessments

  const riskScores: Record<string, number> = {
    negligible: 25,
    low: 20,
    medium: 10,
    high: 0,
    critical: 0,
  }

  let bestScore = 0
  for (const category of riskCategories) {
    const score = riskScores[category] ?? 0
    if (score > bestScore) bestScore = score
  }
  return bestScore
}

/**
 * Calculate the DDS (Due Diligence Statement) status component score (0–20).
 *
 * Scoring:
 *   accepted  = 20
 *   submitted = 15
 *   draft     = 5
 *   rejected  = 0
 *   expired   = 0
 *   none      = 0
 *
 * Takes the BEST score among all DDS records.
 */
export function calcDdsScore(ddsStatuses: string[]): number {
  if (ddsStatuses.length === 0) return 0

  const statusScores: Record<string, number> = {
    accepted: 20,
    submitted: 15,
    draft: 5,
    rejected: 0,
    expired: 0,
  }

  let bestScore = 0
  for (const status of ddsStatuses) {
    const score = statusScores[status] ?? 0
    if (score > bestScore) bestScore = score
  }
  return bestScore
}

/**
 * Calculate the certifications component score (0–15).
 *
 * Scoring:
 *   All active   = 15
 *   Some expired = 10 (has both active and expired)
 *   All expired  = 5  (still better than none — indicates historical compliance)
 *   None         = 0
 */
export function calcCertScore(activeCount: number, expiredCount: number, totalCerts: number): number {
  if (totalCerts === 0) return 0
  if (expiredCount === 0) return 15 // all active
  if (activeCount > 0 && expiredCount > 0) return 10 // some expired
  if (activeCount === 0 && expiredCount > 0) return 5 // all expired
  return 0
}

/**
 * Calculate the data completeness component score (0–10).
 *
 * Scoring:
 *   Full (has geolocation + farm polygon + farmer data) = 10
 *   Partial (at least one of the three)                 = 5
 *   Minimal (none of the three)                         = 0
 */
export function calcDataCompletenessScore(
  hasGeolocation: boolean,
  hasFarmPolygon: boolean,
  hasFarmerData: boolean
): number {
  const checks = [hasGeolocation, hasFarmPolygon, hasFarmerData]
  const trueCount = checks.filter(Boolean).length

  if (trueCount === 3) return 10
  if (trueCount >= 1) return 5
  return 0
}

// ════════════════════════════════════════════════════════════════
// MAIN CALCULATION
// ════════════════════════════════════════════════════════════════

/**
 * Calculate the overall Trust Score (0–100) deterministically.
 *
 * Returns the raw total — callers can use `calculateTrustScoreWithBreakdown()`
 * if they also need the per-component breakdown for display.
 */
export function calculateTrustScore(params: TrustScoreInput): number {
  const eudr = calcEudrScore(params.eudrStatuses)
  const deforest = calcDeforestationScore(params.deforestationRiskCategories)
  const dds = calcDdsScore(params.ddsStatuses)
  const certs = calcCertScore(params.certActiveCount, params.certExpiredCount, params.certTotalCount)
  const completeness = calcDataCompletenessScore(params.hasGeolocation, params.hasFarmPolygon, params.hasFarmerData)

  return Math.min(100, eudr + deforest + dds + certs + completeness)
}

/**
 * Calculate the Trust Score with a full per-component breakdown.
 *
 * Useful for API responses and UI dashboards where you want to show
 * the score composition alongside the total.
 */
export function calculateTrustScoreWithBreakdown(params: TrustScoreInput): TrustScoreBreakdown {
  const eudr = calcEudrScore(params.eudrStatuses)
  const deforest = calcDeforestationScore(params.deforestationRiskCategories)
  const dds = calcDdsScore(params.ddsStatuses)
  const certs = calcCertScore(params.certActiveCount, params.certExpiredCount, params.certTotalCount)
  const completeness = calcDataCompletenessScore(params.hasGeolocation, params.hasFarmPolygon, params.hasFarmerData)

  return {
    total: Math.min(100, eudr + deforest + dds + certs + completeness),
    eudr,
    deforestation: deforest,
    dds,
    certifications: certs,
    dataCompleteness: completeness,
  }
}

// ════════════════════════════════════════════════════════════════
// HELPER: OVERALL STATUS DETERMINATION
// ════════════════════════════════════════════════════════════════

/**
 * Determine the overall EUDR status from compliance records.
 * Returns the best status found, or "pending" if no records exist.
 *
 * Priority order: compliant → in_review → pending → expired → non_compliant
 */
export function determineOverallEudrStatus(statuses: string[]): string {
  if (statuses.length === 0) return 'pending'

  const order = ['compliant', 'in_review', 'pending', 'expired', 'non_compliant']
  for (const status of order) {
    if (statuses.includes(status)) return status
  }
  return statuses[0] || 'pending'
}

/**
 * Determine the overall deforestation risk from assessment records.
 * Returns the best (lowest) risk found, or "medium" as default.
 *
 * Priority order: negligible → low → medium → high → critical
 */
export function determineOverallDeforestationRisk(categories: string[]): string {
  if (categories.length === 0) return 'medium'

  const order = ['negligible', 'low', 'medium', 'high', 'critical']
  for (const cat of order) {
    if (categories.includes(cat)) return cat
  }
  return categories[0] || 'medium'
}
