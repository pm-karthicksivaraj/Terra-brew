import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, validateBody, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { createFarmLandSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  const permError = requireTenantAccess(user, 'farmlands', 'read')
  if (permError) return permError

  const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
  const tenantId = user.tenantId!

  const where: Record<string, unknown> = { tenantId, isActive: true }
  if (search) {
    where.OR = [
      { farmName: { contains: search } },
    ]
  }

  const [farmLands, total] = await Promise.all([
    db.farmLand.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { farmer: { select: { id: true, fullName: true, farmerCode: true } } },
    }),
    db.farmLand.count({ where }),
  ])

  return apiResponse({ farmLands, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const permError = requireTenantAccess(user, 'farmlands', 'create')
  if (permError) return permError

  const body = await request.json()
  const result = validateBody(createFarmLandSchema, body)
  if ('error' in result) return result.error

  const data = result.data
  const tenantId = user.tenantId!

  // Verify farmer belongs to tenant
  const farmer = await db.farmer.findFirst({ where: { id: data.farmerId, tenantId } })
  if (!farmer) return apiError('Farmer not found in this tenant', 404)

  const farmLand = await db.farmLand.create({
    data: {
      ...data,
      tenantId,
      createdBy: user.id,
    } as any,
  })

  return apiResponse(farmLand, 201)
}
