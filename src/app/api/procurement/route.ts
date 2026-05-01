import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'procurement', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const item = await db.procurementRecord.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          collectionCentre: { select: { id: true, centreName: true, centreId: true } },
        },
      })
      if (!item) return apiError('Procurement record not found', 404)
      return apiResponse({ data: item })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const batchIdFilter = url.searchParams.get('batchId')
    const paymentStatusFilter = url.searchParams.get('paymentStatus')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { procurementId: { contains: search } },
        { batchId: { contains: search } },
        { coffeeType: { contains: search } },
        { vehicleNumber: { contains: search } },
      ]
    }
    // Support batchId filter
    if (batchIdFilter) {
      where.batchId = batchIdFilter
    }
    // Support paymentStatus filter
    if (paymentStatusFilter) {
      where.paymentStatus = paymentStatusFilter
    }

    const [items, total] = await Promise.all([
      db.procurementRecord.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          collectionCentre: { select: { id: true, centreName: true, centreId: true } },
        },
      }),
      db.procurementRecord.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'procurement', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.procurementRecord.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'procurement', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.procurementRecord.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Procurement record not found', 404)

    const item = await db.procurementRecord.update({
      where: { id },
      data,
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'procurement', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.procurementRecord.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Procurement record not found', 404)

    const item = await db.procurementRecord.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
