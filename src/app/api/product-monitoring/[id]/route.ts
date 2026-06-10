import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthUser(_req)
  const authError = requireTenantAccess(user, 'product-monitoring', 'read')
  if (authError) return authError

  try {
    const item = await db.productMonitoring.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!item) return apiError('Product monitoring record not found', 404)
    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'product-monitoring', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const existing = await db.productMonitoring.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Product monitoring record not found', 404)

    const updateData: any = {}

    // Status updates
    if (body.status) updateData.status = body.status
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate)
    if (body.actualDate) updateData.actualDate = new Date(body.actualDate)

    // Monitoring details
    if (body.monitoringType) updateData.monitoringType = body.monitoringType
    if (body.inspectorName) updateData.inspectorName = body.inspectorName
    if (body.productName) updateData.productName = body.productName
    if (body.batchId) updateData.batchId = body.batchId
    if (body.orderRef) updateData.orderRef = body.orderRef

    // Quantity checks
    if (body.quantityOrdered !== undefined) updateData.quantityOrdered = parseFloat(body.quantityOrdered)
    if (body.quantityProduced !== undefined) updateData.quantityProduced = parseFloat(body.quantityProduced)
    if (body.quantityPassed !== undefined) updateData.quantityPassed = parseFloat(body.quantityPassed)
    if (body.quantityFailed !== undefined) updateData.quantityFailed = parseFloat(body.quantityFailed)

    // Status checks
    if (body.packingStatus) updateData.packingStatus = body.packingStatus
    if (body.shippingMarkStatus) updateData.shippingMarkStatus = body.shippingMarkStatus
    if (body.labellingStatus) updateData.labellingStatus = body.labellingStatus

    // Report
    if (body.findings !== undefined) updateData.findings = typeof body.findings === 'object' ? JSON.stringify(body.findings) : body.findings
    if (body.reportUrl !== undefined) updateData.reportUrl = body.reportUrl
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.currency) updateData.currency = body.currency
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
    if (body.metadata !== undefined) updateData.metadata = typeof body.metadata === 'object' ? JSON.stringify(body.metadata) : body.metadata

    const updated = await db.productMonitoring.update({ where: { id }, data: updateData })
    return apiResponse(updated)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthUser(_req)
  const authError = requireTenantAccess(user, 'product-monitoring', 'delete')
  if (authError) return authError

  try {
    const existing = await db.productMonitoring.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!existing) return apiError('Product monitoring record not found', 404)

    await db.productMonitoring.update({ where: { id }, data: { isActive: false } })
    return apiResponse({ deleted: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
