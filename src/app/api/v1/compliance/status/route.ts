/**
 * GET /api/v1/compliance/status
 *
 * Public-facing API endpoint for external consumers (EU importers, certification bodies)
 * to check the compliance status and Trust Score of a supplier.
 *
 * Authentication: API Key (X-API-Key header or api_key query parameter)
 * Access: READ-ONLY — only exposes data the supplier has chosen to make public
 */

import { db } from '@/lib/db'
import { validateApiKey, authErrorResponse } from '../../auth'
import {
  calculateTrustScoreWithBreakdown,
  determineOverallEudrStatus,
  determineOverallDeforestationRisk,
  type TrustScoreInput,
} from '../../trust-score'

// ════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════════════

export async function GET(req: Request) {
  // 1. Validate API key
  const authResult = await validateApiKey(req)
  if (!authResult.valid) {
    return authErrorResponse(authResult)
  }

  try {
    const url = new URL(req.url)
    const supplierId = url.searchParams.get('supplier_id')
    const shipmentRef = url.searchParams.get('shipment_ref')

    // 2. Validate required parameters
    if (!supplierId) {
      return Response.json(
        { success: false, error: 'Missing required parameter: supplier_id' },
        { status: 400 }
      )
    }

    // 3. Look up the supplier (tenant) by slug or ID
    const tenant = await db.tenant.findFirst({
      where: {
        OR: [
          { slug: supplierId },
          { id: supplierId },
        ],
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        entityType: true,
        certifications: true,
      },
    })

    if (!tenant) {
      return Response.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    const tenantId = tenant.id

    // 4. Fetch compliance data in parallel
    const [
      eudrCompliances,
      deforestationAssessments,
      dueDiligenceStatements,
      certAssessments,
      farmlands,
      farmersCount,
    ] = await Promise.all([
      // EUDR compliance records
      db.eudrCompliance.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          status: true,
          riskLevel: true,
          geolocationLat: true,
          geolocationLng: true,
          verificationDate: true,
          validFrom: true,
          validUntil: true,
        },
      }),

      // Deforestation assessments
      db.deforestationAssessment.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          riskCategory: true,
          riskScore: true,
          assessmentDate: true,
          validUntil: true,
        },
      }),

      // Due Diligence Statements
      db.dueDiligenceStatement.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          ddsReference: true,
          status: true,
          validFrom: true,
          validUntil: true,
          riskAssessmentResult: true,
        },
      }),

      // Certification assessments
      db.certAssessment.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          status: true,
          validFrom: true,
          validUntil: true,
          certificationStandard: true,
        },
      }),

      // Farmlands (for data completeness)
      db.farmLand.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          polygonGeoJson: true,
          geoCenterLat: true,
          geoCenterLng: true,
          latitude: true,
          longitude: true,
        },
      }),

      // Farmers count
      db.farmer.count({
        where: { tenantId, isActive: true },
      }),
    ])

    // 5. Compute compliance metrics

    // EUDR status
    const eudrStatuses = eudrCompliances.map(e => e.status)
    const overallEudrStatus = determineOverallEudrStatus(eudrStatuses)

    // Last assessment date
    const verificationDates = eudrCompliances
      .map(e => e.verificationDate)
      .filter((d): d is Date => d !== null)
    const lastAssessmentDate = verificationDates.length > 0
      ? new Date(Math.max(...verificationDates.map(d => d.getTime())))
      : null

    // DDS counts
    const activeDdsCount = dueDiligenceStatements.filter(d => d.status === 'accepted').length
    const pendingDdsCount = dueDiligenceStatements.filter(d => d.status === 'draft' || d.status === 'submitted').length
    const expiredDdsCount = dueDiligenceStatements.filter(d => d.status === 'expired').length

    // Deforestation risk
    const deforestRiskCategories = deforestationAssessments.map(a => a.riskCategory).filter((c): c is string => c !== null)
    const overallDeforestationRisk = determineOverallDeforestationRisk(deforestRiskCategories)

    // Certification counts
    const now = new Date()
    const activeCerts = certAssessments.filter(c => {
      if (c.status !== 'passed' && c.status !== 'active' && c.status !== 'certified') return false
      if (c.validUntil && c.validUntil < now) return false
      return true
    }).length
    const expiredCerts = certAssessments.filter(c => {
      return c.validUntil !== null && c.validUntil !== undefined && c.validUntil < now
    }).length
    const totalCerts = certAssessments.length

    // Data completeness
    const hasGeolocation = farmlands.some(f =>
      (f.latitude !== null && f.longitude !== null) ||
      (f.geoCenterLat !== null && f.geoCenterLng !== null)
    )
    const hasFarmPolygon = farmlands.some(f => f.polygonGeoJson !== null && f.polygonGeoJson !== undefined && f.polygonGeoJson !== '')
    const hasFarmerData = farmersCount > 0

    // 6. Calculate Trust Score (with breakdown for the response)
    const trustScoreInput: TrustScoreInput = {
      eudrStatuses,
      deforestationRiskCategories: deforestRiskCategories,
      ddsStatuses: dueDiligenceStatements.map(d => d.status),
      certActiveCount: activeCerts,
      certExpiredCount: expiredCerts,
      certTotalCount: totalCerts,
      hasGeolocation,
      hasFarmPolygon,
      hasFarmerData,
    }
    const breakdown = calculateTrustScoreWithBreakdown(trustScoreInput)

    // 7. Build base response
    const response: Record<string, unknown> = {
      supplier_id: tenant.slug,
      supplier_name: tenant.name,
      entity_type: tenant.entityType,
      country: tenant.countryCode,
      compliance: {
        eudr_status: overallEudrStatus,
        trust_score: breakdown.total,
        trust_score_breakdown: {
          eudr: breakdown.eudr,
          deforestation: breakdown.deforestation,
          dds: breakdown.dds,
          certifications: breakdown.certifications,
          data_completeness: breakdown.dataCompleteness,
        },
        last_assessment_date: lastAssessmentDate?.toISOString() ?? null,
        active_dds_count: activeDdsCount,
        pending_dds_count: pendingDdsCount,
        expired_dds_count: expiredDdsCount,
        deforestation_risk: overallDeforestationRisk,
        certifications_active: activeCerts,
        certifications_expired: expiredCerts,
      },
      generated_at: new Date().toISOString(),
    }

    // 8. Handle shipment-specific data if shipment_ref is provided
    if (shipmentRef) {
      const shipment = await db.shipment.findFirst({
        where: {
          tenantId,
          shipmentId: shipmentRef,
          isActive: true,
        },
        select: {
          id: true,
          shipmentId: true,
          status: true,
          metadata: true,
        },
      })

      if (shipment) {
        // Calculate shipment-specific Trust Score
        // A shipment gets a higher score if it has an associated DDS
        let shipmentDds: {
          ddsReference: string | null
          status: string
        } | null = null

        // Try to find a DDS associated with this shipment
        // The metadata field on shipment may contain DDS reference
        let shipmentMetadata: Record<string, unknown> = {}
        try {
          shipmentMetadata = shipment.metadata ? JSON.parse(shipment.metadata) : {}
        } catch {
          shipmentMetadata = {}
        }

        const ddsRef = shipmentMetadata.ddsReference as string | undefined
        if (ddsRef) {
          const dds = dueDiligenceStatements.find(d => d.ddsReference === ddsRef)
          if (dds) {
            shipmentDds = {
              ddsReference: dds.ddsReference,
              status: dds.status,
            }
          }
        }

        // If no DDS linked via metadata, use the best DDS from the tenant
        if (!shipmentDds && dueDiligenceStatements.length > 0) {
          const bestDds = dueDiligenceStatements.find(d => d.status === 'accepted') ||
            dueDiligenceStatements.find(d => d.status === 'submitted') ||
            dueDiligenceStatements[0]
          shipmentDds = {
            ddsReference: bestDds.ddsReference,
            status: bestDds.status,
          }
        }

        // Shipment Trust Score: base score with DDS bonus
        let shipmentTrustScore = breakdown.total
        if (shipmentDds) {
          const ddsBonus = shipmentDds.status === 'accepted' ? 5 : shipmentDds.status === 'submitted' ? 2 : 0
          shipmentTrustScore = Math.min(100, breakdown.total + ddsBonus)
        }

        response.shipment = {
          ref: shipment.shipmentId,
          status: shipment.status,
          dds_reference: shipmentDds?.ddsReference ?? null,
          dds_status: shipmentDds?.status ?? null,
          trust_score: shipmentTrustScore,
        }
      } else {
        response.shipment = null
      }
    }

    return Response.json(response, { status: 200 })

  } catch (error) {
    console.error('[/api/v1/compliance/status] Error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
