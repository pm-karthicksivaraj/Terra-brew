import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'api-access', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.webhookEndpoint.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        lastTriggeredAt: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!item) return apiError('Webhook endpoint not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'api-access', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.webhookEndpoint.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Webhook endpoint not found', 404)

    const item = await db.webhookEndpoint.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse({ id: item.id, url: item.url, deleted: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
