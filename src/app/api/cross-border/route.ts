import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

// GET /api/cross-border — List cross-border transactions for tenant
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req)
    const statusFilter = url.searchParams.get('status')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { transactionNumber: { contains: search } },
        { commodity: { contains: search } },
        { originCountry: { contains: search } },
        { destinationCountry: { contains: search } },
        { hsCode: { contains: search } },
      ]
    }
    if (statusFilter) where.status = statusFilter

    const [items, total] = await Promise.all([
      db.crossBorderTransaction.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.crossBorderTransaction.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// POST /api/cross-border — Create new cross-border transaction
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Generate transaction number
    const now = new Date()
    const yearStr = now.getFullYear().toString().slice(-2)
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0')
    const count = await db.crossBorderTransaction.count({ where: { tenantId } })
    const transactionNumber = `CBT-${yearStr}${monthStr}-${(count + 1).toString().padStart(4, '0')}`

    const item = await db.crossBorderTransaction.create({
      data: {
        tenantId,
        transactionNumber,
        buyerId: body.buyerId || null,
        escrowId: body.escrowId || null,
        shipmentId: body.shipmentId || null,
        contractId: body.contractId || null,
        createdBy: user!.id,
        status: body.status || 'initiated',
        tradeType: body.tradeType || null,
        commodity: body.commodity || 'coffee',
        grade: body.grade || null,
        quantityKg: body.quantityKg ? parseFloat(body.quantityKg) : null,
        unitPrice: body.unitPrice ? parseFloat(body.unitPrice) : null,
        totalValue: body.totalValue ? parseFloat(body.totalValue) : null,
        currency: body.currency || 'USD',
        incoterm: body.incoterm || null,
        originCountry: body.originCountry || null,
        destinationCountry: body.destinationCountry || null,
        portOfLoading: body.portOfLoading || null,
        portOfDischarge: body.portOfDischarge || null,
        hsCode: body.hsCode || null,
        customsStatus: body.customsStatus || null,
        customsBroker: body.customsBroker || null,
        paymentStatus: body.paymentStatus || null,
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        metadata: body.metadata || null,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
