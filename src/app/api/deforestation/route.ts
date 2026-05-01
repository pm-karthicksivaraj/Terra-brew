import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'deforestation', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const riskCategory = url.searchParams.get('riskCategory') || undefined
    const deforestationDetected = url.searchParams.get('deforestationDetected')

    const where: any = { tenantId, isActive: true }
    if (riskCategory) where.riskCategory = riskCategory
    if (deforestationDetected !== null && deforestationDetected !== undefined) {
      where.deforestationDetected = deforestationDetected === 'true'
    }
    if (search) {
      where.OR = [
        { provider: { contains: search } },
        { methodology: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.deforestationAssessment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmLand: { select: { id: true, farmName: true } },
          eudrCompliance: { select: { id: true, complianceId: true, status: true } },
        },
      }),
      db.deforestationAssessment.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'deforestation', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.deforestationAssessment.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
