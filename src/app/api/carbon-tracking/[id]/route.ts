import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.carbonTracking.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        farmer: { select: { id: true, fullName: true, farmerCode: true } },
        farmLand: { select: { id: true, farmName: true } },
        eudrCompliance: { select: { id: true, complianceId: true, status: true } },
      },
    })
    if (!item) return apiError('Carbon tracking record not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.carbonTracking.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Carbon tracking record not found', 404)

    // Auto-calculate emissions fields
    const scope1 = body.scope1Emissions ?? existing.scope1Emissions ?? 0
    const scope2 = body.scope2Emissions ?? existing.scope2Emissions ?? 0
    const scope3 = body.scope3Emissions ?? existing.scope3Emissions ?? 0
    const totalEmissions = scope1 + scope2 + scope3
    const carbonSequestered = body.carbonSequestered ?? existing.carbonSequestered ?? 0
    const netEmissions = totalEmissions - carbonSequestered

    const item = await db.carbonTracking.update({
      where: { id },
      data: {
        ...body,
        totalEmissions,
        netEmissions,
      },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.carbonTracking.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Carbon tracking record not found', 404)

    // Soft delete
    const item = await db.carbonTracking.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
