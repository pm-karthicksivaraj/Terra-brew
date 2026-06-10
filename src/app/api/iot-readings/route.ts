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
    const sensorId = url.searchParams.get('sensorId') || undefined

    if (idParam) {
      const record = await db.ioTReading.findFirst({
        where: { id: idParam, sensor: { tenantId } },
        include: { sensor: { select: { id: true, deviceName: true, sensorType: true } } },
      })
      if (!record) return apiError('IoT sensor reading not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const alertFilter = url.searchParams.get('isAlert')
    const typeFilter = url.searchParams.get('readingType') || undefined

    const where: any = { sensor: { tenantId } }
    if (sensorId) where.sensorId = sensorId
    if (alertFilter === 'true') where.isAlert = true
    if (typeFilter) where.readingType = typeFilter
    if (search) {
      where.readingType = { contains: search, mode: 'insensitive' as const }
    }

    const [records, total] = await Promise.all([
      db.ioTReading.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { sensor: { select: { id: true, deviceName: true, sensorType: true } } },
      }),
      db.ioTReading.count({ where }),
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

    if (!body.sensorId) return apiError('Sensor ID is required', 400)
    if (!body.readingType) return apiError('Reading type is required', 400)
    if (body.value === undefined || body.value === null) return apiError('Value is required', 400)

    // Verify sensor belongs to tenant
    const sensor = await db.ioTSensor.findFirst({
      where: { id: body.sensorId, tenantId, isActive: true },
    })
    if (!sensor) return apiError('IoT sensor not found', 404)

    // Determine if this reading triggers an alert
    let isAlert = false
    let alertType: string | null = null
    if (body.isAlert === true) {
      isAlert = true
      alertType = body.alertType || null
    }

    const record = await db.ioTReading.create({
      data: {
        sensorId: body.sensorId,
        readingType: body.readingType,
        value: parseFloat(body.value),
        unit: body.unit || '',
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        isAlert,
        alertType,
      },
    })

    // Update sensor last reading
    await db.ioTSensor.update({
      where: { id: body.sensorId },
      data: {
        lastReading: JSON.stringify({ readingType: body.readingType, value: body.value, unit: body.unit }),
        lastReadingAt: new Date(),
      },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
