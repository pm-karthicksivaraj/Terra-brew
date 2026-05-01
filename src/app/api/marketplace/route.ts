import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'marketplace', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const item = await db.marketplaceListing.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
        },
      })
      if (!item) return apiError('Marketplace listing not found', 404)
      return apiResponse({ data: item })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const listingStatusFilter = url.searchParams.get('listingStatus')
    const coffeeTypeFilter = url.searchParams.get('coffeeType')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { listingId: { contains: search } },
        { coffeeVariety: { contains: search } },
        { origin: { contains: search } },
      ]
    }
    if (listingStatusFilter) {
      where.listingStatus = listingStatusFilter
    }
    if (coffeeTypeFilter) {
      where.coffeeType = coffeeTypeFilter
    }

    const [items, total] = await Promise.all([
      db.marketplaceListing.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
        },
      }),
      db.marketplaceListing.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'marketplace', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.marketplaceListing.create({
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
  const authError = requireTenantAccess(user, 'marketplace', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.marketplaceListing.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Marketplace listing not found', 404)

    const item = await db.marketplaceListing.update({
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
  const authError = requireTenantAccess(user, 'marketplace', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.marketplaceListing.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Marketplace listing not found', 404)

    const item = await db.marketplaceListing.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
