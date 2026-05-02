import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'compliance-marketplace', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.complianceBooking.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        service: true,
      },
    })
    if (!item) return apiError('Compliance booking not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'compliance-marketplace', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.complianceBooking.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Compliance booking not found', 404)

    const item = await db.complianceBooking.update({
      where: { id },
      data: body,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
