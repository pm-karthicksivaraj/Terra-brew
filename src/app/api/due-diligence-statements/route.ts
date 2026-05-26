import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import { submitDueDiligenceStatement, type DueDiligenceStatementData } from '@/lib/integrations/traces'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'due-diligence-statements', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || undefined
    const operatorCountry = url.searchParams.get('operatorCountry') || undefined

    const where: any = { tenantId, isActive: true }
    if (status) where.status = status
    if (operatorCountry) where.operatorCountry = operatorCountry
    if (search) {
      where.OR = [
        { operatorName: { contains: search } },
        { operatorEori: { contains: search } },
        { ddsReference: { contains: search } },
        { commodityType: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.dueDiligenceStatement.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          eudrCompliance: { select: { id: true, complianceId: true, status: true, riskLevel: true } },
        },
      }),
      db.dueDiligenceStatement.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'due-diligence-statements', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Create the DDS record in the database
    const item = await db.dueDiligenceStatement.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    // If status is "submitted", call TRACES integration to submit the DDS
    if (body.status === 'submitted') {
      try {
        const tracesData: DueDiligenceStatementData = {
          operatorName: body.operatorName || '',
          operatorEori: body.operatorEori || '',
          operatorCountry: body.operatorCountry || '',
          commodityType: body.commodityType || 'coffee',
          commodityCode: body.commodityCode || '',
          countryOfProduction: body.countryOfProduction || '',
          regionOfProduction: body.regionOfProduction || '',
          geoCoordinates: body.geoCoordinates ? JSON.parse(body.geoCoordinates) : [],
          productionStartDate: body.productionStartDate || '',
          productionEndDate: body.productionEndDate || '',
          deforestationRiskAssessment: body.riskAssessmentResult || 'low',
          riskAssessmentProvider: body.riskAssessmentProvider || '',
          riskAssessmentDate: body.riskAssessmentDate || '',
          traceabilityInfo: body.traceabilityInfo ? JSON.parse(body.traceabilityInfo) : { farmerIds: [], farmLandIds: [], batchIds: [] },
          additionalDocuments: body.additionalDocuments ? JSON.parse(body.additionalDocuments) : [],
        }

        const tracesResponse = await submitDueDiligenceStatement(tracesData)

        // Update the DDS record with the TRACES reference
        const updated = await db.dueDiligenceStatement.update({
          where: { id: item.id },
          data: {
            ddsReference: tracesResponse.ddsReference,
            submittedAt: new Date(tracesResponse.submissionDate),
            status: tracesResponse.status === 'rejected' ? 'rejected' : 'submitted',
            rejectedReason: tracesResponse.errors?.map(e => `${e.field}: ${e.message}`).join('; ') || null,
          },
        })

        return apiResponse({ record: updated, tracesResponse }, 201)
      } catch (tracesError: any) {
        // TRACES submission failed — keep record as draft and return warning
        const updated = await db.dueDiligenceStatement.update({
          where: { id: item.id },
          data: { status: 'draft' },
        })
        return apiResponse({
          record: updated,
          warning: `DDS saved as draft. TRACES submission failed: ${tracesError.message}`,
        }, 201)
      }
    }

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
