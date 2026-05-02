import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'iot-tracking', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    // Verify sensor belongs to tenant
    const sensor = await db.ioTSensor.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!sensor) return apiError('IoT sensor not found', 404)

    const { page, pageSize, sortBy, sortOrder } = getPaginationParams(request as any)
    const url = new URL(request.url)
    const readingType = url.searchParams.get('readingType') || undefined
    const isAlert = url.searchParams.get('isAlert')

    const where: any = { sensorId: id }
    if (readingType) where.readingType = readingType
    if (isAlert !== null && isAlert !== undefined) {
      where.isAlert = isAlert === 'true'
    }

    const [items, total] = await Promise.all([
      db.ioTReading.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.ioTReading.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'iot-tracking', 'create')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()

    // Verify sensor belongs to tenant
    const sensor = await db.ioTSensor.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!sensor) return apiError('IoT sensor not found', 404)

    if (!body.readingType || body.value === undefined || !body.unit) {
      return apiError('readingType, value, and unit are required', 400)
    }

    const reading = await db.ioTReading.create({
      data: {
        sensorId: id,
        readingType: body.readingType,
        value: body.value,
        unit: body.unit,
        latitude: body.latitude,
        longitude: body.longitude,
        isAlert: body.isAlert || false,
        alertType: body.alertType,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })

    // Update sensor's last reading
    await db.ioTSensor.update({
      where: { id },
      data: {
        lastReading: JSON.stringify({ readingType: body.readingType, value: body.value, unit: body.unit }),
        lastReadingAt: new Date(),
        batteryLevel: body.batteryLevel ?? sensor.batteryLevel,
      },
    })

    return apiResponse(reading, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
