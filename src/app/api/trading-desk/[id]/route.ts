import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'trading-desk', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.tradingContract.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        buyer: { select: { id: true, companyName: true, buyerCode: true, country: true, email: true } },
      },
    })
    if (!item) return apiError('Trading contract not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'trading-desk', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.tradingContract.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Trading contract not found', 404)

    const item = await db.tradingContract.update({
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
  const authError = requireTenantAccess(user, 'trading-desk', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.tradingContract.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Trading contract not found', 404)

    const item = await db.tradingContract.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
