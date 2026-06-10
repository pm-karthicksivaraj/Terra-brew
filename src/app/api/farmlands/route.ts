import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { validateData, farmLandSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmlands', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')

    // Single-item fetch by ID
    if (idParam) {
      const item = await db.farmLand.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true, province: true, contactNumber: true } },
          _count: { select: { cultivations: true, harvestTraceabilities: true, cropMonitorings: true } },
        },
      })
      if (!item) return apiError('Farm land not found', 404)
      return apiResponse({ data: item })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { farmName: { contains: search } },
        { plotBlockId: { contains: search } },
        { soilType: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.farmLand.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          farmer: { select: { id: true, fullName: true, farmerCode: true, province: true } },
        },
      }),
      db.farmLand.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmlands', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    const validation = validateData(farmLandSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors?.issues },
        { status: 400 }
      )
    }
    const validatedData = validation.data!

    const item = await db.farmLand.create({
      data: {
        ...validatedData,
        farmName: validatedData.farmName ?? '',
        farmerId: validatedData.farmerId ?? '',
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
  const authError = requireTenantAccess(user, 'farmlands', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.farmLand.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Farm land not found', 404)

    const item = await db.farmLand.update({
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
  const authError = requireTenantAccess(user, 'farmlands', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.farmLand.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Farm land not found', 404)

    const item = await db.farmLand.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
