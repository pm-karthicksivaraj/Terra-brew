import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'buyers', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const country = url.searchParams.get('country') || undefined
    const buyerType = url.searchParams.get('buyerType') || undefined

    const where: any = { tenantId, isActive: true }
    if (country) where.country = country
    if (buyerType) where.buyerType = buyerType
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { buyerCode: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.buyer.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { shipments: true, contracts: true } },
        },
      }),
      db.buyer.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'buyers', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.companyName) {
      return apiError('companyName is required', 400)
    }

    const item = await db.buyer.create({
      data: {
        ...body,
        tenantId,
        createdBy: user!.id,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
