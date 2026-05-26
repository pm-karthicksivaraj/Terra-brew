import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import { submitDueDiligenceStatement, type DueDiligenceStatementData } from '@/lib/integrations/traces'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'due-diligence-statements', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.dueDiligenceStatement.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        eudrCompliance: { select: { id: true, complianceId: true, status: true, riskLevel: true } },
      },
    })
    if (!item) return apiError('Due Diligence Statement not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'due-diligence-statements', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.dueDiligenceStatement.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Due Diligence Statement not found', 404)

    // If status is changing to "submitted" and hasn't been submitted before, call TRACES
    if (body.status === 'submitted' && existing.status !== 'submitted' && !existing.ddsReference) {
      try {
        const tracesData: DueDiligenceStatementData = {
          operatorName: body.operatorName || existing.operatorName || '',
          operatorEori: body.operatorEori || existing.operatorEori || '',
          operatorCountry: body.operatorCountry || existing.operatorCountry || '',
          commodityType: body.commodityType || existing.commodityType || 'coffee',
          commodityCode: body.commodityCode || existing.commodityCode || '',
          countryOfProduction: body.countryOfProduction || existing.countryOfProduction || '',
          regionOfProduction: body.regionOfProduction || existing.regionOfProduction || '',
          geoCoordinates: (body.geoCoordinates || existing.geoCoordinates) ? JSON.parse(body.geoCoordinates || existing.geoCoordinates || '[]') : [],
          productionStartDate: body.productionStartDate || (existing.productionStartDate?.toISOString() || ''),
          productionEndDate: body.productionEndDate || (existing.productionEndDate?.toISOString() || ''),
          deforestationRiskAssessment: body.riskAssessmentResult || existing.riskAssessmentResult || 'low',
          riskAssessmentProvider: body.riskAssessmentProvider || existing.riskAssessmentProvider || '',
          riskAssessmentDate: body.riskAssessmentDate || (existing.riskAssessmentDate?.toISOString() || ''),
          traceabilityInfo: (body.traceabilityInfo || existing.traceabilityInfo) ? JSON.parse(body.traceabilityInfo || existing.traceabilityInfo || '{}') : { farmerIds: [], farmLandIds: [], batchIds: [] },
          additionalDocuments: (body.additionalDocuments || existing.additionalDocuments) ? JSON.parse(body.additionalDocuments || existing.additionalDocuments || '[]') : [],
        }

        const tracesResponse = await submitDueDiligenceStatement(tracesData)

        // Update with TRACES reference and submitted data
        const item = await db.dueDiligenceStatement.update({
          where: { id },
          data: {
            ...body,
            ddsReference: tracesResponse.ddsReference,
            submittedAt: new Date(tracesResponse.submissionDate),
            status: tracesResponse.status === 'rejected' ? 'rejected' : 'submitted',
            rejectedReason: tracesResponse.errors?.map(e => `${e.field}: ${e.message}`).join('; ') || null,
          },
        })

        return apiResponse({ record: item, tracesResponse })
      } catch (tracesError: any) {
        // TRACES submission failed — don't change status to submitted
        const item = await db.dueDiligenceStatement.update({
          where: { id },
          data: { ...body, status: existing.status }, // Keep original status
        })
        return apiResponse({
          record: item,
          warning: `TRACES submission failed: ${tracesError.message}. Status remains "${existing.status}".`,
        })
      }
    }

    // Normal update (no TRACES submission needed)
    const item = await db.dueDiligenceStatement.update({
      where: { id },
      data: body,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'due-diligence-statements', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.dueDiligenceStatement.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Due Diligence Statement not found', 404)

    // Soft delete
    const item = await db.dueDiligenceStatement.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
