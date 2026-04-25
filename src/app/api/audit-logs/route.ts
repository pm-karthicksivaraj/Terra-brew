import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requirePlatformAdmin, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const { page, pageSize } = getPaginationParams(req)

    // Filters
    const tenantId = url.searchParams.get('tenantId') || undefined
    const action = url.searchParams.get('action') || undefined
    const entity = url.searchParams.get('entity') || undefined
    const startDate = url.searchParams.get('startDate') || undefined
    const endDate = url.searchParams.get('endDate') || undefined

    const where: any = {}
    if (tenantId) where.tenantId = tenantId
    if (action) where.action = action
    if (entity) where.entity = { contains: entity }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          tenantId: true,
          userId: true,
          action: true,
          entity: true,
          entityId: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.auditLog.count({ where }),
    ])

    return apiResponse({ logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
