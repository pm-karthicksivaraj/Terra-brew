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
      const record = await db.ioTDevice.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: { readings: { orderBy: { recordedAt: 'desc' }, take: 20 } },
      })
      if (!record) return apiError('IoT device not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const statusFilter = url.searchParams.get('status') || undefined
    const typeFilter = url.searchParams.get('deviceType') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' as const } },
        { deviceCode: { contains: search, mode: 'insensitive' as const } },
        { manufacturer: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (statusFilter) where.status = statusFilter
    if (typeFilter) where.deviceType = typeFilter

    const [records, total] = await Promise.all([
      db.ioTDevice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.ioTDevice.count({ where }),
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

    if (!body.deviceName) return apiError('Device name is required', 400)
    if (!body.deviceType) return apiError('Device type is required', 400)

    const record = await db.ioTDevice.create({
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
