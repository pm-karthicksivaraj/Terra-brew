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
    if (body.plannedFinishDate) updateData.plannedFinishDate = new Date(body.plannedFinishDate)
    if (body.actualFinishDate) updateData.actualFinishDate = new Date(body.actualFinishDate)

    // Monitoring details
    if (body.callConfirmation !== undefined) updateData.callConfirmation = body.callConfirmation
    if (body.callDate) updateData.callDate = new Date(body.callDate)
    if (body.callNotes !== undefined) updateData.callNotes = body.callNotes
    if (body.onSiteCheckDate) updateData.onSiteCheckDate = new Date(body.onSiteCheckDate)

    // On-site check
    if (body.quantityCheck) updateData.quantityCheck = body.quantityCheck
    if (body.quantityOrderTotal !== undefined) updateData.quantityOrderTotal = parseInt(body.quantityOrderTotal)
    if (body.quantityActualTotal !== undefined) updateData.quantityActualTotal = parseInt(body.quantityActualTotal)
    if (body.quantityTotalPackages !== undefined) updateData.quantityTotalPackages = parseInt(body.quantityTotalPackages)
    if (body.quantityPackagingDesc !== undefined) updateData.quantityPackagingDesc = body.quantityPackagingDesc
    if (body.visualCheck) updateData.visualCheck = body.visualCheck
    if (body.packagingCheck) updateData.packagingCheck = body.packagingCheck
    if (body.shippingMarkCheck) updateData.shippingMarkCheck = body.shippingMarkCheck
    if (body.additionalItemsFindings !== undefined) updateData.additionalItemsFindings = body.additionalItemsFindings
    if (body.additionalItemsPIRequirements !== undefined) updateData.additionalItemsPIRequirements = body.additionalItemsPIRequirements

    // Packing
    if (body.individualPackingDesc !== undefined) updateData.individualPackingDesc = body.individualPackingDesc
    if (body.exportCartonDesc !== undefined) updateData.exportCartonDesc = body.exportCartonDesc
    if (body.innerPackingDesc !== undefined) updateData.innerPackingDesc = body.innerPackingDesc

    // Report
    if (body.reportNumber) updateData.reportNumber = body.reportNumber
    if (body.reportDate) updateData.reportDate = new Date(body.reportDate)
    if (body.reportUrl !== undefined) updateData.reportUrl = body.reportUrl
    if (body.overallResult) updateData.overallResult = body.overallResult
    if (body.remarks !== undefined) updateData.remarks = body.remarks
    if (body.productPhotos) updateData.productPhotos = JSON.stringify(body.productPhotos)
    if (body.packingPhotos) updateData.packingPhotos = JSON.stringify(body.packingPhotos)
    if (body.shippingMarkPhotos) updateData.shippingMarkPhotos = JSON.stringify(body.shippingMarkPhotos)
    if (body.goodsPilePhotos) updateData.goodsPilePhotos = JSON.stringify(body.goodsPilePhotos)
    if (body.notes !== undefined) updateData.notes = body.notes

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
