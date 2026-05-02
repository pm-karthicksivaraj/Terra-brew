import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'qc-verification', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const verificationType = url.searchParams.get('verificationType') || undefined
    const status = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (verificationType) where.verificationType = verificationType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { inspectorName: { contains: search } },
        { inspectorCertNo: { contains: search } },
        { notes: { contains: search } },
        { entityId: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.qcVerification.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.qcVerification.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'qc-verification', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.verificationType) {
      return apiError('verificationType is required', 400)
    }
    if (!body.entityType || !body.entityId) {
      return apiError('entityType and entityId are required', 400)
    }

    const item = await db.qcVerification.create({
      data: {
        ...body,
        tenantId,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
