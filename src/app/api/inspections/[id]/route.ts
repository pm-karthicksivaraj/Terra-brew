import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'logistics', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const item = await db.inspectionRequest.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!item) return apiError('Inspection request not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'logistics', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.inspectionRequest.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Inspection request not found', 404)

    const updateData: any = { ...body }

    // Convert date strings to Date objects
    const dateFields = ['appointmentDate', 'reportDate']
    for (const field of dateFields) {
      if (body[field]) {
        updateData[field] = new Date(body[field])
      }
    }

    // If completing inspection, compute rates
    if (body.status === 'completed' && body.overallResult) {
      updateData.reportDate = new Date()
    }

    const item = await db.inspectionRequest.update({
      where: { id },
      data: updateData,
    })
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'logistics', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const existing = await db.inspectionRequest.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Inspection request not found', 404)

    await db.inspectionRequest.update({
      where: { id },
      data: { isActive: false },
    })
    return apiResponse({ success: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
