import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'analytics', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const reportType = url.searchParams.get('reportType') || undefined
    const status = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (reportType) where.reportType = reportType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.analyticsReport.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.analyticsReport.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'analytics', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.reportType) {
      return apiError('reportType is required', 400)
    }
    if (!body.title) {
      return apiError('title is required', 400)
    }

    // Create report in generating status
    const item = await db.analyticsReport.create({
      data: {
        reportType: body.reportType,
        title: body.title,
        description: body.description,
        dateRangeStart: body.dateRangeStart ? new Date(body.dateRangeStart) : null,
        dateRangeEnd: body.dateRangeEnd ? new Date(body.dateRangeEnd) : null,
        parameters: body.parameters ? JSON.stringify(body.parameters) : null,
        format: body.format || 'json',
        status: 'generating',
        isScheduled: body.isScheduled || false,
        scheduleCron: body.scheduleCron || null,
        tenantId,
        createdBy: user!.id,
      },
    })

    // In production, trigger async report generation here
    // For now, immediately mark as ready with placeholder data
    const generatedReport = await db.analyticsReport.update({
      where: { id: item.id },
      data: {
        status: 'ready',
        data: JSON.stringify({ message: 'Report generated successfully', generatedAt: new Date().toISOString() }),
        lastGeneratedAt: new Date(),
      },
    })

    return apiResponse(generatedReport, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
