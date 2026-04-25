import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmers', 'read')
  if (authError) return authError

  try {
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const tenantId = user!.tenantId!

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { farmerCode: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [farmers, total] = await Promise.all([
      db.farmer.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { farmLands: true, cultivations: true } },
        },
      }),
      db.farmer.count({ where }),
    ])

    // Mask PII fields based on role
    const maskedFarmers = farmers.map((f: any) => ({
      ...f,
      contactNumber: user!.role !== 'tenant_admin' && user!.role !== 'manager'
        ? f.contactNumber?.slice(0, 4) + '****' + f.contactNumber?.slice(-3)
        : f.contactNumber,
      nationalIdNo: user!.role !== 'tenant_admin'
        ? (f.nationalIdNo ? f.nationalIdNo.slice(0, 4) + '****' : null)
        : f.nationalIdNo,
      email: user!.role !== 'tenant_admin' && user!.role !== 'manager'
        ? (f.email ? f.email.slice(0, 2) + '****@' + f.email.split('@')[1] : null)
        : f.email,
    }))

    return apiResponse({ data: maskedFarmers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmers', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const farmer = await db.farmer.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    return apiResponse(farmer, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmers', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.farmer.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Farmer not found', 404)

    const item = await db.farmer.update({
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
  const authError = requireTenantAccess(user, 'farmers', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.farmer.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Farmer not found', 404)

    const item = await db.farmer.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
