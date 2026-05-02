import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { createCustomerPortalSession } from '@/lib/billing/stripe'

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'settings', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { returnUrl } = body

    if (!returnUrl) {
      return apiError('returnUrl is required', 400)
    }

    const tenantId = user!.tenantId!
    const session = await createCustomerPortalSession({
      tenantId,
      returnUrl,
    })

    return apiResponse({ url: session.url }, 200)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
