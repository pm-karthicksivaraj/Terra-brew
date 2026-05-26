import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

// GET /api/escrow — List escrow transactions for tenant
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
        { escrowNumber: { contains: search } },
        { paymentMethod: { contains: search } },
        { bankReference: { contains: search } },
      ]
    }
    if (statusFilter) where.status = statusFilter

    const [items, total] = await Promise.all([
      db.escrowTransaction.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.escrowTransaction.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// POST /api/escrow — Create new escrow transaction
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Generate escrow number
    const now = new Date()
    const yearStr = now.getFullYear().toString().slice(-2)
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0')
    const count = await db.escrowTransaction.count({ where: { tenantId } })
    const escrowNumber = `ESC-${yearStr}${monthStr}-${(count + 1).toString().padStart(4, '0')}`

    const item = await db.escrowTransaction.create({
      data: {
        tenantId,
        escrowNumber,
        buyerId: body.buyerId || null,
        sellerId: body.sellerId || null,
        rfqId: body.rfqId || null,
        contractId: body.contractId || null,
        createdBy: user!.id,
        status: body.status || 'initiated',
        amount: body.amount ? parseFloat(body.amount) : null,
        currency: body.currency || 'USD',
        escrowFee: body.escrowFee ? parseFloat(body.escrowFee) : null,
        escrowFeePayer: body.escrowFeePayer || null,
        fundingDeadline: body.fundingDeadline ? new Date(body.fundingDeadline) : null,
        inspectionDeadline: body.inspectionDeadline ? new Date(body.inspectionDeadline) : null,
        releaseDeadline: body.releaseDeadline ? new Date(body.releaseDeadline) : null,
        paymentMethod: body.paymentMethod || null,
        bankReference: body.bankReference || null,
        notes: body.notes || null,
        metadata: body.metadata || null,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
