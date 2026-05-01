import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'export-docs', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const documentType = url.searchParams.get('documentType') || undefined
    const status = url.searchParams.get('status') || undefined

    const where: any = { tenantId, isActive: true }
    if (documentType) where.documentType = documentType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { documentNumber: { contains: search } },
        { issuingAuthority: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.exportDocument.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          shipment: { select: { id: true, shipmentId: true, status: true } },
        },
      }),
      db.exportDocument.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'export-docs', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.documentType) {
      return apiError('documentType is required', 400)
    }

    const item = await db.exportDocument.create({
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
