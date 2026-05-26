import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireAuth, requireTenantAccess } from '@/lib/api-middleware'

/**
 * GET /api/modules/enabled
 * Get enabled modules for the current tenant.
 * Used by sidebar to determine which nav items to show.
 */
export async function GET() {
  const user = await getAuthUser()
  const authError = requireAuth(user)
  if (authError) return authError

  if (!user?.tenantId) {
    // Platform admin or no tenant — return empty (all modules visible based on role)
    return NextResponse.json({ success: true, data: {} })
  }

  const tenant = await db.tenant.findUnique({
    where: { id: user.tenantId },
    select: { enabledModules: true },
  })

  let enabledModules: Record<string, boolean> = {}
  if (tenant?.enabledModules) {
    try {
      enabledModules = typeof tenant.enabledModules === 'string'
        ? JSON.parse(tenant.enabledModules)
        : tenant.enabledModules
    } catch {
      enabledModules = {}
    }
  }

  return NextResponse.json({ success: true, data: enabledModules })
}
