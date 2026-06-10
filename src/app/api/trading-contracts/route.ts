import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.tradingContract.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: { buyer: true },
      })
      if (!record) return apiError('Trading contract not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const statusFilter = url.searchParams.get('status') || undefined
    const buyerIdFilter = url.searchParams.get('buyerId') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { contractNumber: { contains: search, mode: 'insensitive' as const } },
        { commodity: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (statusFilter) where.status = statusFilter
    if (buyerIdFilter) where.buyerId = buyerIdFilter

    const [records, total] = await Promise.all([
      db.tradingContract.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { buyer: { select: { id: true, companyName: true } } },
      }),
      db.tradingContract.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.buyerId) return apiError('Buyer ID is required', 400)

    const record = await db.tradingContract.create({
      data: {
        tenantId,
        buyerId: body.buyerId,
        createdBy: user!.id,
        contractNumber: body.contractNumber,
        contractType: body.contractType || 'spot',
        commodity: body.commodity || 'coffee',
        grade: body.grade,
        quantityKg: body.quantityKg ? parseFloat(String(body.quantityKg)) : null,
        pricePerKg: body.pricePerKg ? parseFloat(String(body.pricePerKg)) : null,
        totalValue: body.totalValue ? parseFloat(String(body.totalValue)) : null,
        currency: body.currency || 'EUR',
        qualitySpecs: body.qualitySpecs,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        deliveryPort: body.deliveryPort,
        paymentTerms: body.paymentTerms,
        status: body.status || 'draft',
        notes: body.notes,
      },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
