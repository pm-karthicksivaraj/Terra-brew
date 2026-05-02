import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'iot-tracking', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.trackingUpdate.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        shipment: { select: { id: true, shipmentId: true, status: true, commodity: true } },
      },
    })
    if (!item) return apiError('Tracking update not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
