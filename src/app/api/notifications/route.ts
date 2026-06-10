import { getAuthUser, requireAuth, apiResponse, apiError } from '@/lib/api-middleware'

// GET /api/notifications — List notifications for current user's tenant
export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  // Notification model does not exist in the schema
  return apiResponse({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    unreadCount: 0,
  })
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireAuth(user)
  if (authError) return authError

  // Notification model does not exist in the schema
  return apiError('Not Implemented: Notification model does not exist', 501)
}
