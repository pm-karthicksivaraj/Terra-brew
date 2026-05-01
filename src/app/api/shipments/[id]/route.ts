import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.shipment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        buyer: { select: { id: true, companyName: true, buyerCode: true, country: true } },
        exportDocuments: { where: { isActive: true } },
        trackingUpdates: { where: { isActive: true }, orderBy: { timestamp: 'desc' } },
        iotSensors: { where: { isActive: true } },
      },
    })
    if (!item) return apiError('Shipment not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.shipment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Shipment not found', 404)

    const item = await db.shipment.update({
      where: { id },
      data: body,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.shipment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Shipment not found', 404)

    const item = await db.shipment.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
