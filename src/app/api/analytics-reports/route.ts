import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'reports', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.analyticsReport.findFirst({
        where: { id: idParam, tenantId, isActive: true },
      })
      if (!record) return apiError('Analytics report not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const typeFilter = url.searchParams.get('reportType') || undefined
    const statusFilter = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { reportCode: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (typeFilter) where.reportType = typeFilter
    if (statusFilter) where.status = statusFilter

    const [records, total] = await Promise.all([
      db.analyticsReport.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.analyticsReport.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'reports', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.title) return apiError('Title is required', 400)
    if (!body.reportType) return apiError('Report type is required', 400)

    const record = await db.analyticsReport.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
        dateRangeStart: body.dateRangeStart ? new Date(body.dateRangeStart) : null,
        dateRangeEnd: body.dateRangeEnd ? new Date(body.dateRangeEnd) : null,
      },
    })

    return apiResponse(record, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
