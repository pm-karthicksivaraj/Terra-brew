import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.logisticsProvider.findFirst({
        where: { id: idParam, tenantId, isActive: true },
      })
      if (!record) return apiError('Logistics provider not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const typeFilter = url.searchParams.get('providerType') || undefined
    const statusFilter = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { providerCode: { contains: search, mode: 'insensitive' as const } },
        { website: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (typeFilter) where.providerType = typeFilter
    if (statusFilter) where.status = statusFilter

    const [records, total] = await Promise.all([
      db.logisticsProvider.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.logisticsProvider.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'shipments', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.companyName) return apiError('Company name is required', 400)
    if (!body.providerType) return apiError('Provider type is required', 400)

    const record = await db.logisticsProvider.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
