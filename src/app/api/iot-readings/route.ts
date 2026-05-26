import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')
    const deviceId = url.searchParams.get('deviceId') || undefined

    if (idParam) {
      const record = await db.ioTSensorReading.findFirst({
        where: { id: idParam, tenantId },
        include: { device: { select: { id: true, deviceName: true, deviceType: true } } },
      })
      if (!record) return apiError('IoT sensor reading not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const alertFilter = url.searchParams.get('alertTriggered')
    const typeFilter = url.searchParams.get('readingType') || undefined

    const where: any = { tenantId }
    if (deviceId) where.deviceId = deviceId
    if (alertFilter === 'true') where.alertTriggered = true
    if (typeFilter) where.readingType = typeFilter
    if (search) {
      where.readingType = { contains: search, mode: 'insensitive' as const }
    }

    const [records, total] = await Promise.all([
      db.ioTSensorReading.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { device: { select: { id: true, deviceName: true, deviceType: true } } },
      }),
      db.ioTSensorReading.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.deviceId) return apiError('Device ID is required', 400)
    if (!body.readingType) return apiError('Reading type is required', 400)
    if (body.value === undefined || body.value === null) return apiError('Value is required', 400)

    // Verify device belongs to tenant
    const device = await db.ioTDevice.findFirst({
      where: { id: body.deviceId, tenantId, isActive: true },
    })
    if (!device) return apiError('IoT device not found', 404)

    // Check if alert should be triggered
    let alertTriggered = false
    let alertSeverity: string | null = null
    if (device.alertThresholdMin !== null && body.value < device.alertThresholdMin!) {
      alertTriggered = true
      alertSeverity = 'warning'
    }
    if (device.alertThresholdMax !== null && body.value > device.alertThresholdMax!) {
      alertTriggered = true
      alertSeverity = body.value > device.alertThresholdMax! * 1.2 ? 'critical' : 'warning'
    }

    const record = await db.ioTSensorReading.create({
      data: {
        tenantId,
        deviceId: body.deviceId,
        shipmentId: body.shipmentId || device.shipmentId || null,
        readingType: body.readingType,
        value: body.value,
        unit: body.unit || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        alertTriggered,
        alertSeverity,
        rawData: body.rawData || null,
      },
    })

    // Update device last ping
    await db.ioTDevice.update({
      where: { id: body.deviceId },
      data: { lastPingAt: new Date() },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
