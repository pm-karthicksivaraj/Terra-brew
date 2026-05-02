import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || undefined
    const contractType = url.searchParams.get('contractType') || undefined

    const where: any = { tenantId, isActive: true }
    if (status) where.status = status
    if (contractType) where.contractType = contractType
    if (search) {
      where.OR = [
        { contractNumber: { contains: search } },
        { commodity: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.tradingContract.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          buyer: { select: { id: true, companyName: true, buyerCode: true, country: true } },
        },
      }),
      db.tradingContract.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'trading-desk', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.buyerId) {
      return apiError('buyerId is required', 400)
    }

    const item = await db.tradingContract.create({
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
