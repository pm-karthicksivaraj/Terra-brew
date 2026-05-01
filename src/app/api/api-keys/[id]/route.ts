import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'api-access', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.apiKey.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('API key not found', 404)

    const item = await db.apiKey.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse({ id: item.id, name: item.name, revoked: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
