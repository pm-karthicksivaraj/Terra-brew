import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'coffee-inspections', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const item = await db.coffeeInspection.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          farmLand: { select: { id: true, farmName: true, plotBlockId: true } },
        },
      })
      if (!item) return apiError('Coffee inspection not found', 404)
      return apiResponse({ data: item })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const batchIdFilter = url.searchParams.get('batchId')
    const passFailFilter = url.searchParams.get('passFail')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { inspectionId: { contains: search, mode: 'insensitive' } },
        { batchId: { contains: search, mode: 'insensitive' } },
        { inspectorName: { contains: search, mode: 'insensitive' } },
        { overallGrade: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (batchIdFilter) {
      where.batchId = batchIdFilter
    }
    if (passFailFilter) {
      where.passFail = passFailFilter
    }

    const [items, total] = await Promise.all([
      db.coffeeInspection.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          farmLand: { select: { id: true, farmName: true, plotBlockId: true } },
        },
      }),
      db.coffeeInspection.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'coffee-inspections', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.coffeeInspection.create({
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
  const authError = requireTenantAccess(user, 'coffee-inspections', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.coffeeInspection.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Coffee inspection not found', 404)

    const item = await db.coffeeInspection.update({
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
  const authError = requireTenantAccess(user, 'coffee-inspections', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.coffeeInspection.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Coffee inspection not found', 404)

    const item = await db.coffeeInspection.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
