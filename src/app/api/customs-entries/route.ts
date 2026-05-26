import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'export-docs', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.customsEntry.findFirst({
        where: { id: idParam, tenantId, isActive: true },
      })
      if (!record) return apiError('Customs entry not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const statusFilter = url.searchParams.get('status') || undefined
    const shipmentFilter = url.searchParams.get('shipmentId') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { entryNumber: { contains: search, mode: 'insensitive' as const } },
        { customsOffice: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (statusFilter) where.status = statusFilter
    if (shipmentFilter) where.shipmentId = shipmentFilter

    const [records, total] = await Promise.all([
      db.customsEntry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.customsEntry.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'export-docs', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    const record = await db.customsEntry.create({
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
