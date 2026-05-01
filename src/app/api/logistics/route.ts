import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'logistics', 'read')
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
        { shipmentId: { contains: search } },
        { vesselName: { contains: search } },
        { containerNumber: { contains: search } },
        { bookingNumber: { contains: search } },
        { freightForwarder: { contains: search } },
        { customsBroker: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.shipment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          buyer: { select: { id: true, companyName: true, buyerCode: true, country: true } },
          trackingUpdates: {
            where: { isActive: true },
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
          iotSensors: {
            where: { isActive: true },
            select: {
              id: true,
              sensorType: true,
              deviceId: true,
              deviceName: true,
              lastReading: true,
              lastReadingAt: true,
              batteryLevel: true,
            },
          },
          exportDocuments: {
            where: { isActive: true },
            select: { id: true, documentType: true, status: true },
          },
          _count: { select: { trackingUpdates: true, iotSensors: true } },
        },
      }),
      db.shipment.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'logistics', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Create a shipment with logistics-specific defaults
    const item = await db.shipment.create({
      data: {
        tenantId,
        createdBy: user!.id,
        shipmentId: body.shipmentId,
        status: body.status || 'planned',
        originCountry: body.originCountry,
        destinationCountry: body.destinationCountry,
        portOfLoading: body.portOfLoading,
        portOfDischarge: body.portOfDischarge,
        vesselName: body.vesselName,
        vesselImo: body.vesselImo,
        containerNumber: body.containerNumber,
        bookingNumber: body.bookingNumber,
        billOfLadingNumber: body.billOfLadingNumber,
        estimatedDeparture: body.estimatedDeparture ? new Date(body.estimatedDeparture) : null,
        actualDeparture: body.actualDeparture ? new Date(body.actualDeparture) : null,
        estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : null,
        actualArrival: body.actualArrival ? new Date(body.actualArrival) : null,
        totalWeightKg: body.totalWeightKg,
        totalBags: body.totalBags,
        commodity: body.commodity || 'coffee',
        grade: body.grade,
        contractReference: body.contractReference,
        freightForwarder: body.freightForwarder,
        customsBroker: body.customsBroker,
        shippingLine: body.shippingLine,
        trackingUrl: body.trackingUrl,
        notes: body.notes,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
        buyerId: body.buyerId,
      },
      include: {
        buyer: { select: { id: true, companyName: true } },
      },
    })

    // Create initial tracking update if logistics details provided
    if (body.originCountry || body.portOfLoading) {
      await db.trackingUpdate.create({
        data: {
          tenantId,
          shipmentId: item.id,
          updateType: 'departure',
          location: body.portOfLoading || body.originCountry,
          description: `Logistics entry created — origin: ${body.originCountry || 'N/A'}`,
          reportedBy: user!.id,
        },
      })
    }

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
