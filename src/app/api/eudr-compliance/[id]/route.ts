import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.eudrCompliance.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        farmer: { select: { id: true, fullName: true, farmerCode: true } },
        farmLand: { select: { id: true, farmName: true, polygonGeoJson: true, latitude: true, longitude: true } },
        deforestationAssessments: { where: { isActive: true } },
      },
    })
    if (!item) return apiError('EUDR compliance record not found', 404)
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
    const existing = await db.eudrCompliance.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('EUDR compliance record not found', 404)

    const item = await db.eudrCompliance.update({
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
  const authError = requireTenantAccess(user, 'eudr-compliance', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.eudrCompliance.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('EUDR compliance record not found', 404)

    const item = await db.eudrCompliance.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
