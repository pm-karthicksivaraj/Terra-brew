import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'buyers', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.buyer.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        _count: { select: { shipments: true, contracts: true } },
      },
    })
    if (!item) return apiError('Buyer not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'buyers', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.buyer.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Buyer not found', 404)

    const item = await db.buyer.update({
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
  const authError = requireTenantAccess(user, 'buyers', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.buyer.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Buyer not found', 404)

    const item = await db.buyer.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
