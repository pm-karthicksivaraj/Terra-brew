import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    if (idParam) {
      const record = await db.serviceBooking.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: { service: true },
      })
      if (!record) return apiError('Service booking not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const statusFilter = url.searchParams.get('status') || undefined
    const serviceFilter = url.searchParams.get('serviceId') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' as const } },
        { targetEntity: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (statusFilter) where.status = statusFilter
    if (serviceFilter) where.serviceId = serviceFilter

    const [records, total] = await Promise.all([
      db.serviceBooking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { service: { select: { id: true, serviceName: true, providerName: true, category: true } } },
      }),
      db.serviceBooking.count({ where }),
    ])

    return apiResponse({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.serviceId) return apiError('Service ID is required', 400)

    // Verify service exists and belongs to tenant
    const service = await db.complianceService.findFirst({
      where: { id: body.serviceId, tenantId, isActive: true },
    })
    if (!service) return apiError('Compliance service not found', 404)

    const record = await db.serviceBooking.create({
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
