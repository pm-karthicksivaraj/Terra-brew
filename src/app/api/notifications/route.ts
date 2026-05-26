import { getAuthUser, requireAuth, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

// GET /api/notifications — List notifications for current user's tenant
export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const userId = user!.id
    const url = new URL(req.url)

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')))
    const isRead = url.searchParams.get('isRead')
    const type = url.searchParams.get('type')

    // Build where clause: notifications for this tenant AND (userId is null OR userId matches current user)
    const where: any = {
      tenantId,
      OR: [
        { userId: null },
        { userId },
      ],
    }

    if (isRead !== null && isRead !== undefined && isRead !== '') {
      where.isRead = isRead === 'true'
    }
    if (type) {
      where.type = type
    }

    const [items, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: {
          tenantId,
          isRead: false,
          OR: [
            { userId: null },
            { userId },
          ],
        },
      }),
    ])

    return apiResponse({
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      unreadCount,
    })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const userId = user!.id
    const body = await req.json()

    if (body.markAll === true) {
      // Mark all unread notifications as read for this user/tenant
      const result = await db.notification.updateMany({
        where: {
          tenantId,
          isRead: false,
          OR: [
            { userId: null },
            { userId },
          ],
        },
        data: { isRead: true },
      })

      return apiResponse({ marked: result.count })
    }

    if (body.ids && Array.isArray(body.ids)) {
      // Mark specific notifications as read
      const result = await db.notification.updateMany({
        where: {
          id: { in: body.ids },
          tenantId,
          OR: [
            { userId: null },
            { userId },
          ],
        },
        data: { isRead: true },
      })

      return apiResponse({ marked: result.count })
    }

    return apiError('Provide {ids: string[]} or {markAll: true}', 400)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
