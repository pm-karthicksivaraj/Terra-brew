import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'analytics', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.analyticsReport.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!item) return apiError('Analytics report not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'analytics', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.analyticsReport.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Analytics report not found', 404)

    const item = await db.analyticsReport.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
