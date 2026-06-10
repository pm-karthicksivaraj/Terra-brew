import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'iot-tracking', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.ioTSensor.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: { readings: { orderBy: { timestamp: 'desc' }, take: 20 } },
      })
      if (!record) return apiError('IoT device not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const typeFilter = url.searchParams.get('sensorType') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' as const } },
        { deviceId: { contains: search, mode: 'insensitive' as const } },
        { manufacturer: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (typeFilter) where.sensorType = typeFilter

    const [records, total] = await Promise.all([
      db.ioTSensor.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.ioTSensor.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'iot-tracking', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.deviceId) return apiError('Device ID is required', 400)
    if (!body.sensorType) return apiError('Sensor type is required', 400)

    const record = await db.ioTSensor.create({
      data: {
        tenantId,
        shipmentId: body.shipmentId || null,
        sensorType: body.sensorType,
        deviceId: body.deviceId,
        deviceName: body.deviceName || null,
        manufacturer: body.manufacturer || null,
        lastReading: body.lastReading || null,
        lastReadingAt: body.lastReadingAt ? new Date(body.lastReadingAt) : null,
        batteryLevel: body.batteryLevel ? parseFloat(body.batteryLevel) : null,
      },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
