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
      const record = await db.originCountry.findFirst({
        where: { id: idParam, tenantId, isActive: true },
      })
      if (!record) return apiError('Origin country not found', 404)
      return apiResponse({ data: record })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(request)
    const riskFilter = url.searchParams.get('eudrRiskCategory') || undefined

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { countryName: { contains: search, mode: 'insensitive' as const } },
        { countryCode: { contains: search, mode: 'insensitive' as const } },
        { region: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    if (riskFilter) where.eudrRiskCategory = riskFilter

    const [records, total] = await Promise.all([
      db.originCountry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.originCountry.count({ where }),
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

    if (!body.countryCode) return apiError('Country code is required', 400)
    if (!body.countryName) return apiError('Country name is required', 400)

    const record = await db.originCountry.create({
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
