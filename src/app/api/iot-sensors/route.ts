import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'iot-tracking', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const sensorType = url.searchParams.get('sensorType') || undefined
    const shipmentId = url.searchParams.get('shipmentId') || undefined

    const where: any = { tenantId, isActive: true }
    if (sensorType) where.sensorType = sensorType
    if (shipmentId) where.shipmentId = shipmentId
    if (search) {
      where.OR = [
        { deviceId: { contains: search } },
        { deviceName: { contains: search } },
        { manufacturer: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.ioTSensor.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          shipment: { select: { id: true, shipmentId: true, status: true } },
          _count: { select: { readings: true } },
        },
      }),
      db.ioTSensor.count({ where }),
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

    if (!body.sensorType) {
      return apiError('sensorType is required', 400)
    }
    if (!body.deviceId) {
      return apiError('deviceId is required', 400)
    }

    // Verify shipment if provided
    if (body.shipmentId) {
      const shipment = await db.shipment.findFirst({
        where: { id: body.shipmentId, tenantId, isActive: true },
      })
      if (!shipment) return apiError('Shipment not found', 404)
    }

    const item = await db.ioTSensor.create({
      data: {
        ...body,
        tenantId,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
