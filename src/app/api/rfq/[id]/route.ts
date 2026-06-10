import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

// GET /api/rfq/[id] — Get RFQ with responses
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!

    const item = await db.rFQ.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        responses: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!item) return apiError('RFQ not found', 404)
    return apiResponse({ data: item })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// PUT /api/rfq/[id] — Update RFQ (status changes, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'update')
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!
    const body = await req.json()

    const existing = await db.rFQ.findFirst({ where: { id, tenantId, isActive: true } })
    if (!existing) return apiError('RFQ not found', 404)

    const data: any = {}
    if (body.status !== undefined) data.status = body.status
    if (body.commodity !== undefined) data.commodity = body.commodity
    if (body.variety !== undefined) data.variety = body.variety
    if (body.grade !== undefined) data.grade = body.grade
    if (body.quantityKg !== undefined) data.quantityKg = body.quantityKg ? parseFloat(body.quantityKg) : null
    if (body.targetPricePerKg !== undefined) data.targetPricePerKg = body.targetPricePerKg ? parseFloat(body.targetPricePerKg) : null
    if (body.currency !== undefined) data.currency = body.currency
    if (body.deliveryLocation !== undefined) data.deliveryLocation = body.deliveryLocation
    if (body.deliveryDateFrom !== undefined) data.deliveryDateFrom = body.deliveryDateFrom ? new Date(body.deliveryDateFrom) : null
    if (body.deliveryDateTo !== undefined) data.deliveryDateTo = body.deliveryDateTo ? new Date(body.deliveryDateTo) : null
    if (body.incoterms !== undefined) data.incoterms = body.incoterms
    if (body.originCountry !== undefined) data.originCountry = body.originCountry
    if (body.destinationCountry !== undefined) data.destinationCountry = body.destinationCountry
    if (body.certifications !== undefined) data.certifications = body.certifications
    if (body.processingMethod !== undefined) data.processingMethod = body.processingMethod
    if (body.cupScoreMin !== undefined) data.cupScoreMin = body.cupScoreMin ? parseFloat(body.cupScoreMin) : null
    if (body.description !== undefined) data.description = body.description
    if (body.closesAt !== undefined) data.closesAt = body.closesAt ? new Date(body.closesAt) : null
    if (body.awardedToResponseId !== undefined) data.awardedToResponseId = body.awardedToResponseId || null
    if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    if (body.metadata !== undefined) data.metadata = body.metadata

    // Handle response status updates
    if (body.responseUpdates && Array.isArray(body.responseUpdates)) {
      for (const ru of body.responseUpdates) {
        if (ru.id && ru.status) {
          await db.rFQResponse.update({
            where: { id: ru.id },
            data: { status: ru.status },
          })
        }
      }
    }

    const item = await db.rFQ.update({
      where: { id },
      data,
      include: {
        responses: { where: { isActive: true } },
      },
    })

    return apiResponse({ data: item })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// DELETE /api/rfq/[id] — Soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'delete')
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!

    const existing = await db.rFQ.findFirst({ where: { id, tenantId, isActive: true } })
    if (!existing) return apiError('RFQ not found', 404)

    await db.rFQ.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse({ success: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
