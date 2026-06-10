import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireAuth } from '@/lib/api-middleware'

/**
 * GET /api/v1/compliance/trust-score
 *
 * Authenticated endpoint that calculates the aggregate trust score
 * for the authenticated tenant.
 *
 * Returns:
 *   - Average trust score across all EudrCompliance records
 *   - Detailed breakdown by status, risk level, DDS, certification
 *   - Per-record trust scores
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    const authError = requireAuth(user)
    if (authError) return authError

    const tenantId = user!.tenantId
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant context required' },
        { status: 403 }
      )
    }

    // Fetch all EUDR compliance records for the tenant
    const eudrRecords = await db.eudrCompliance.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        complianceId: true,
        status: true,
        riskLevel: true,
        deforestationRiskScore: true,
        dueDiligenceStatement: true,
        verificationDate: true,
        validFrom: true,
        validUntil: true,
        updatedAt: true,
        farmer: { select: { isCertified: true } },
      },
    })

    // If no records, return empty state
    if (eudrRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          average_trust_score: null,
          total_records: 0,
          breakdown: {
            by_status: {},
            by_risk_level: {},
            dds_coverage: { has_dds: 0, no_dds: 0 },
            certification_coverage: null,
          },
          records: [],
          computed_trust_score: null,
        },
      })
    }

    // ═══ Compute per-record trust scores ═══
    const computedRecords = eudrRecords.map(rec => {
      let score = 0

      // EUDR compliance status component
      const statusScores: Record<string, number> = {
        compliant: 40,
        in_review: 20,
        pending: 10,
        non_compliant: -20,
        expired: 0,
      }
      score += statusScores[rec.status] ?? 0

      // Deforestation risk inversion component
      const riskScores: Record<string, number> = {
        low: 30,
        medium: 15,
        high: -10,
        critical: -20,
      }
      score += riskScores[rec.riskLevel ?? ''] ?? 0

      // DDS existence component
      const hasDds = !!(rec.dueDiligenceStatement && rec.dueDiligenceStatement.trim() !== '')
      if (hasDds) score += 15

      // Certification component — check farmer.isCertified
      if (rec.farmer?.isCertified) score += 15

      // Clamp to 0-100
      score = Math.max(0, Math.min(100, score))

      return {
        id: rec.id,
        compliance_id: rec.complianceId,
        status: rec.status,
        risk_level: rec.riskLevel,
        deforestation_risk_score: rec.deforestationRiskScore,
        computed_trust_score: score,
        has_dds: hasDds,
        is_farmer_certified: rec.farmer?.isCertified ?? false,
        verification_date: rec.verificationDate?.toISOString() ?? null,
        valid_from: rec.validFrom?.toISOString() ?? null,
        valid_until: rec.validUntil?.toISOString() ?? null,
        last_updated: rec.updatedAt.toISOString(),
      }
    })

    // ═══ Aggregate statistics ═══

    // By status
    const byStatus: Record<string, number> = {}
    for (const rec of eudrRecords) {
      const s = rec.status || 'unknown'
      byStatus[s] = (byStatus[s] || 0) + 1
    }

    // By risk level
    const byRiskLevel: Record<string, number> = {}
    for (const rec of eudrRecords) {
      const r = rec.riskLevel || 'unknown'
      byRiskLevel[r] = (byRiskLevel[r] || 0) + 1
    }

    // DDS coverage
    const hasDds = eudrRecords.filter(r =>
      r.dueDiligenceStatement && r.dueDiligenceStatement.trim() !== ''
    ).length
    const noDds = eudrRecords.length - hasDds

    // Certification coverage
    const certifiedFarmersCount = await db.farmer.count({
      where: { tenantId, isActive: true, isCertified: true },
    })
    const totalFarmersCount = await db.farmer.count({
      where: { tenantId, isActive: true },
    })

    // Average computed trust score
    const avgTrustScore = computedRecords.length > 0
      ? Math.round(
          (computedRecords.reduce((sum, r) => sum + r.computed_trust_score, 0) /
            computedRecords.length) *
            10
        ) / 10
      : null

    // Also compute the overall trust score with certification
    let overallTrustScore = avgTrustScore ?? 0
    if (totalFarmersCount > 0 && certifiedFarmersCount > 0) {
      const certRatio = certifiedFarmersCount / totalFarmersCount
      overallTrustScore = Math.min(100, overallTrustScore + Math.round(certRatio * 15))
    }

    return NextResponse.json({
      success: true,
      data: {
        average_trust_score: avgTrustScore,
        overall_trust_score: Math.max(0, Math.min(100, overallTrustScore)),
        total_records: eudrRecords.length,
        breakdown: {
          by_status: byStatus,
          by_risk_level: byRiskLevel,
          dds_coverage: { has_dds: hasDds, no_dds: noDds },
          certification_coverage: {
            certified_farmers: certifiedFarmersCount,
            total_farmers: totalFarmersCount,
            ratio: totalFarmersCount > 0
              ? Math.round((certifiedFarmersCount / totalFarmersCount) * 100) / 100
              : 0,
          },
        },
        records: computedRecords,
      },
    })
  } catch (error: any) {
    console.error('[Trust Score API Error]', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
