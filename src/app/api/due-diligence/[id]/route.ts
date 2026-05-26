import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.dueDiligenceStatement.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        eudrCompliance: { select: { id: true, complianceId: true, status: true, riskLevel: true, trustScore: true } },
      },
    })
    if (!item) return apiError('Due Diligence Statement not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await req.json()
    const item = await db.dueDiligenceStatement.updateMany({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      data: body,
    })
    if (item.count === 0) return apiError('Due Diligence Statement not found', 404)
    const updated = await db.dueDiligenceStatement.findUnique({ where: { id } })
    return apiResponse(updated)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.dueDiligenceStatement.updateMany({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      data: { isActive: false },
    })
    if (item.count === 0) return apiError('Due Diligence Statement not found', 404)
    return apiResponse({ deleted: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
