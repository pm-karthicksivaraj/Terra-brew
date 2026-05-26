import { getAuthUser, requireAuth, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

// GET /api/notifications/[id] — Get a single notification
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!
    const userId = user!.id

    const notification = await db.notification.findFirst({
      where: {
        id,
        tenantId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
    })

    if (!notification) {
      return apiError('Notification not found', 404)
    }

    return apiResponse(notification)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// PUT /api/notifications/[id] — Update notification (mark as read)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!
    const userId = user!.id
    const body = await req.json()

    const notification = await db.notification.findFirst({
      where: {
        id,
        tenantId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
    })

    if (!notification) {
      return apiError('Notification not found', 404)
    }

    const updated = await db.notification.update({
      where: { id },
      data: {
        isRead: body.isRead !== undefined ? body.isRead : notification.isRead,
      },
    })

    return apiResponse(updated)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

// DELETE /api/notifications/[id] — Delete a notification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { id } = await params
    const tenantId = user!.tenantId!
    const userId = user!.id

    const notification = await db.notification.findFirst({
      where: {
        id,
        tenantId,
        OR: [
          { userId: null },
          { userId },
        ],
      },
    })

    if (!notification) {
      return apiError('Notification not found', 404)
    }

    await db.notification.delete({
      where: { id },
    })

    return apiResponse({ deleted: true })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
