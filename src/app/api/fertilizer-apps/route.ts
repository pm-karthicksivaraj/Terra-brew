import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'fertilizer-apps', 'read')
  if (authError) return authError

  try {
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const tenantId = user!.tenantId!

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { fertilizerName: { contains: search, mode: 'insensitive' } },
        { fertilizerType: { contains: search, mode: 'insensitive' } },
        { applicationMethod: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      db.fertilizerApplication.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true } },
          farmLand: { select: { id: true, farmName: true, plotBlockId: true } },
        },
      }),
      db.fertilizerApplication.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'fertilizer-apps', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const item = await db.fertilizerApplication.create({
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
  const authError = requireTenantAccess(user, 'fertilizer-apps', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.fertilizerApplication.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Fertilizer application not found', 404)

    const item = await db.fertilizerApplication.update({
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
  const authError = requireTenantAccess(user, 'fertilizer-apps', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.fertilizerApplication.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Fertilizer application not found', 404)

    const item = await db.fertilizerApplication.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
