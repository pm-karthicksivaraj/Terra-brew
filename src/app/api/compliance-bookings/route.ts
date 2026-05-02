import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'compliance-marketplace', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { notes: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.complianceBooking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          service: true,
        },
      }),
      db.complianceBooking.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'compliance-marketplace', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.serviceId) {
      return apiError('serviceId is required', 400)
    }

    // Verify service exists
    const service = await db.complianceService.findFirst({
      where: { id: body.serviceId, isActive: true },
    })
    if (!service) return apiError('Compliance service not found', 404)

    const item = await db.complianceBooking.create({
      data: {
        ...body,
        tenantId,
        bookedBy: user!.id,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
