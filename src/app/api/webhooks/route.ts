import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'api-access', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const { page, pageSize, sortBy, sortOrder } = getPaginationParams(req as any)

    const where: any = { tenantId, isActive: true }

    const [items, total] = await Promise.all([
      db.webhookEndpoint.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          url: true,
          events: true,
          isActive: true,
          lastTriggeredAt: true,
          failureCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.webhookEndpoint.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'api-access', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    if (!body.url) {
      return apiError('url is required', 400)
    }
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return apiError('events (non-empty array) is required', 400)
    }

    // Generate webhook signing secret
    const secret = crypto.randomBytes(32).toString('hex')

    const item = await db.webhookEndpoint.create({
      data: {
        url: body.url,
        events: JSON.stringify(body.events),
        secret,
        tenantId,
        createdBy: user!.id,
      },
    })

    // Return the secret only once — it cannot be retrieved later
    return apiResponse({
      id: item.id,
      url: item.url,
      events: body.events,
      secret,
      isActive: item.isActive,
      createdAt: item.createdAt,
    }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
