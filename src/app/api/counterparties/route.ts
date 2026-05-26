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
      const record = await db.counterparty.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: { tradingContracts: { where: { isActive: true }, take: 10, orderBy: { createdAt: 'desc' } } },
      })
      if (!record) return apiError('Counterparty not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const statusFilter = url.searchParams.get('verificationStatus') || undefined
    const countryFilter = url.searchParams.get('country') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { counterpartyCode: { contains: search, mode: 'insensitive' as const } },
        { tradingName: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (statusFilter) where.verificationStatus = statusFilter
    if (countryFilter) where.country = countryFilter

    const [records, total] = await Promise.all([
      db.counterparty.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.counterparty.count({ where }),
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

    if (!body.companyName) return apiError('Company name is required', 400)

    const record = await db.counterparty.create({
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
