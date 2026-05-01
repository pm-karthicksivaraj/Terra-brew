import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'deforestation', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.deforestationAssessment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        farmLand: { select: { id: true, farmName: true, latitude: true, longitude: true } },
        eudrCompliance: { select: { id: true, complianceId: true, status: true, riskLevel: true } },
      },
    })
    if (!item) return apiError('Deforestation assessment not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'deforestation', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.deforestationAssessment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Deforestation assessment not found', 404)

    const item = await db.deforestationAssessment.update({
      where: { id },
      data: body,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
