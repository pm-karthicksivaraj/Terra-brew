import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, validateBody, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { createCultivationSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  const permError = requireTenantAccess(user, 'cultivations', 'read')
  if (permError) return permError

  const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
  const tenantId = user.tenantId!

  const where: Record<string, unknown> = { tenantId, isActive: true }
  if (search) {
    where.OR = [
      { farmPlotName: { contains: search } },
      { cultivatedCrop: { contains: search } },
    ]
  }

  const [cultivations, total] = await Promise.all([
    db.cultivation.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        farmer: { select: { id: true, fullName: true } },
        farmLand: { select: { id: true, farmName: true } },
      },
    }),
    db.cultivation.count({ where }),
  ])

  return apiResponse({ cultivations, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const permError = requireTenantAccess(user, 'cultivations', 'create')
  if (permError) return permError

  const body = await request.json()
  const result = validateBody(createCultivationSchema, body)
  if ('error' in result) return result.error

  const data = result.data
  const tenantId = user.tenantId!

  // Verify farmer and farmland belong to tenant
  const farmer = await db.farmer.findFirst({ where: { id: data.farmerId, tenantId } })
  if (!farmer) return apiError('Farmer not found in this tenant', 404)
  const farmLand = await db.farmLand.findFirst({ where: { id: data.farmLandId, tenantId } })
  if (!farmLand) return apiError('Farm land not found in this tenant', 404)

  const cultivation = await db.cultivation.create({
    data: {
      ...data,
      tenantId,
      createdBy: user.id,
      sowingDate: data.sowingDate ? new Date(data.sowingDate) : undefined,
    } as any,
  })

  return apiResponse(cultivation, 201)
}
