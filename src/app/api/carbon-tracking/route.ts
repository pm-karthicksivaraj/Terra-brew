import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const verificationStatus = url.searchParams.get('verificationStatus') || undefined

    const where: any = { tenantId, isActive: true }
    if (verificationStatus) where.verificationStatus = verificationStatus
    if (search) {
      where.OR = [
        { trackingId: { contains: search } },
        { batchId: { contains: search } },
        { reportingPeriod: { contains: search } },
        { methodology: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.carbonTracking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          farmLand: { select: { id: true, farmName: true } },
          eudrCompliance: { select: { id: true, complianceId: true } },
        },
      }),
      db.carbonTracking.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Auto-calculate emissions fields
    const scope1 = body.scope1Emissions || 0
    const scope2 = body.scope2Emissions || 0
    const scope3 = body.scope3Emissions || 0
    const totalEmissions = scope1 + scope2 + scope3
    const carbonSequestered = body.carbonSequestered || 0
    const netEmissions = totalEmissions - carbonSequestered

    const item = await db.carbonTracking.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
        totalEmissions,
        netEmissions,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
