import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'smart-contracts', 'read')
  if (authError) return authError

  try {
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const tenantId = user!.tenantId!

    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { contractId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { contractType: { contains: search, mode: 'insensitive' } },
        { partyA: { contains: search, mode: 'insensitive' } },
        { partyB: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (statusFilter) {
      where.status = statusFilter
    }

    const [items, total] = await Promise.all([
      db.smartContract.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
        },
      }),
      db.smartContract.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'smart-contracts', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.smartContract.create({
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
  const authError = requireTenantAccess(user, 'smart-contracts', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.smartContract.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Smart contract not found', 404)

    const item = await db.smartContract.update({
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
  const authError = requireTenantAccess(user, 'smart-contracts', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.smartContract.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Smart contract not found', 404)

    const item = await db.smartContract.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
