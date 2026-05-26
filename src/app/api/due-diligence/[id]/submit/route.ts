import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import { submitDueDiligenceStatement, type DueDiligenceStatementData } from '@/lib/integrations/traces'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!

    const dds = await db.dueDiligenceStatement.findFirst({
      where: { id, tenantId, isActive: true },
    })
    if (!dds) return apiError('Due Diligence Statement not found', 404)
    if (dds.status !== 'draft') return apiError('Only draft DDS can be submitted', 400)

    // Build the payload for TRACES submission
    const geoCoords = dds.geoCoordinates ? JSON.parse(dds.geoCoordinates) : []
    const traceInfo = dds.traceabilityInfo ? JSON.parse(dds.traceabilityInfo) : { farmerIds: [], farmLandIds: [], batchIds: [] }
    const additionalDocs = dds.additionalDocuments ? JSON.parse(dds.additionalDocuments) : []

    const payload: DueDiligenceStatementData = {
      operatorName: dds.operatorName || '',
      operatorEori: dds.operatorEori || '',
      operatorCountry: dds.operatorCountry || '',
      commodityType: dds.commodityType || 'coffee',
      commodityCode: dds.commodityCode || '0901',
      countryOfProduction: dds.countryOfProduction || '',
      regionOfProduction: dds.regionOfProduction || '',
      geoCoordinates: geoCoords,
      productionStartDate: dds.productionStartDate?.toISOString() || '',
      productionEndDate: dds.productionEndDate?.toISOString() || '',
      deforestationRiskAssessment: (dds.riskAssessment as any) || 'low',
      riskAssessmentProvider: dds.riskAssessmentProvider || 'simulated',
      riskAssessmentDate: dds.riskAssessmentDate?.toISOString() || new Date().toISOString(),
      traceabilityInfo,
      additionalDocuments: additionalDocs,
    }

    // Submit to TRACES
    const result = await submitDueDiligenceStatement(payload)

    // Update the DDS record
    const updated = await db.dueDiligenceStatement.update({
      where: { id },
      data: {
        status: result.status === 'accepted' ? 'accepted' : 'submitted',
        tracesRef: result.ddsReference,
        submittedDate: new Date(result.submissionDate),
        notes: result.message ? `${dds.notes || ''}\n${result.message}`.trim() : dds.notes,
      },
    })

    return apiResponse({ dds: updated, tracesResult: result })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
