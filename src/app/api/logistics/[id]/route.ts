import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'logistics', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.shipment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        buyer: { select: { id: true, companyName: true, buyerCode: true, country: true, email: true, phone: true } },
        trackingUpdates: {
          where: { isActive: true },
          orderBy: { timestamp: 'desc' },
        },
        iotSensors: {
          where: { isActive: true },
          include: {
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 10,
            },
          },
        },
        exportDocuments: {
          where: { isActive: true },
        },
      },
    })
    if (!item) return apiError('Logistics entry not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'logistics', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.shipment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Logistics entry not found', 404)

    // Build update data, converting date strings to Date objects
    const updateData: any = { ...body }
    const dateFields = [
      'estimatedDeparture', 'actualDeparture', 'estimatedArrival', 'actualArrival',
    ]
    for (const field of dateFields) {
      if (body[field]) {
        updateData[field] = new Date(body[field])
      }
    }

    // If status changed, auto-create a tracking update
    if (body.status && body.status !== existing.status) {
      const updateTypeMap: Record<string, string> = {
        booked: 'departure',
        in_transit: 'departure',
        arrived: 'arrival',
        delivered: 'delivery',
        cancelled: 'customs',
      }

      await db.trackingUpdate.create({
        data: {
          tenantId: user!.tenantId!,
          shipmentId: id,
          updateType: updateTypeMap[body.status] || 'customs',
          location: body.portOfDischarge || existing.portOfDischarge || undefined,
          description: `Status updated from ${existing.status} to ${body.status}`,
          reportedBy: user!.id,
        },
      })
    }

    const item = await db.shipment.update({
      where: { id },
      data: updateData,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
