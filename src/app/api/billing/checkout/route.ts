import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { createCheckoutSession } from '@/lib/billing/stripe'
import { createSubscription as createPayPalSub } from '@/lib/billing/paypal'

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'settings', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { provider, planId, successUrl, cancelUrl } = body

    if (!provider || !planId) {
      return apiError('provider and planId are required', 400)
    }

    const tenantId = user!.tenantId!

    if (provider === 'stripe') {
      if (!successUrl || !cancelUrl) {
        return apiError('successUrl and cancelUrl are required for Stripe checkout', 400)
      }
      const session = await createCheckoutSession({
        tenantId,
        planId,
        successUrl,
        cancelUrl,
        email: user!.email,
      })
      return apiResponse({ sessionId: session.sessionId, url: session.url }, 201)
    }

    if (provider === 'paypal') {
      const result = await createPayPalSub({
        tenantId,
        planId,
        returnUrl: successUrl || '',
        cancelUrl: cancelUrl || '',
      })
      const approvalUrl = result.links?.find((l: any) => l.rel === 'approve')?.href || null
      return apiResponse({ subscriptionId: result.id, approvalUrl }, 201)
    }

    return apiError('Invalid provider. Supported: stripe, paypal', 400)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
