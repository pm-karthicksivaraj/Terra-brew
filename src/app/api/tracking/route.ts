import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'iot-tracking', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const shipmentId = url.searchParams.get('shipmentId')

    if (!shipmentId) {
      return apiError('shipmentId query parameter is required', 400)
    }

    const { page, pageSize, sortBy, sortOrder } = getPaginationParams(req as any)

    const where: any = { tenantId, shipmentId, isActive: true }

    const [items, total] = await Promise.all([
      db.trackingUpdate.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          shipment: { select: { id: true, shipmentId: true, status: true } },
        },
      }),
      db.trackingUpdate.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'iot-tracking', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.shipmentId) {
      return apiError('shipmentId is required', 400)
    }
    if (!body.updateType) {
      return apiError('updateType is required', 400)
    }

    // Verify shipment belongs to tenant
    const shipment = await db.shipment.findFirst({
      where: { id: body.shipmentId, tenantId, isActive: true },
    })
    if (!shipment) return apiError('Shipment not found', 404)

    const item = await db.trackingUpdate.create({
      data: {
        ...body,
        tenantId,
        reportedBy: user!.id,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
