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
      db.apiKey.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          permissions: true,
          tier: true,
          rateLimitPerMin: true,
          lastUsedAt: true,
          expiresAt: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.apiKey.count({ where }),
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

    if (!body.name) {
      return apiError('name is required', 400)
    }

    // Generate API key
    const rawKey = `tb_${crypto.randomBytes(24).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.substring(0, 8)

    const item = await db.apiKey.create({
      data: {
        name: body.name,
        keyHash,
        keyPrefix,
        permissions: body.permissions ? JSON.stringify(body.permissions) : '[]',
        tier: body.tier || 'starter',
        rateLimitPerMin: body.rateLimitPerMin || 60,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        tenantId,
        createdBy: user!.id,
      },
    })

    // Return the raw key only once — it cannot be retrieved later
    return apiResponse({
      id: item.id,
      name: item.name,
      key: rawKey,
      keyPrefix: item.keyPrefix,
      tier: item.tier,
      rateLimitPerMin: item.rateLimitPerMin,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
    }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
