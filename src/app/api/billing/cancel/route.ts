import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { cancelSubscription } from '@/lib/billing/stripe'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'settings', 'update')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionProvider: true,
        stripeSubscriptionId: true,
        paypalSubscriptionId: true,
      },
    })

    if (!tenant) {
      return apiError('Tenant not found', 404)
    }

    const provider = tenant.subscriptionProvider

    if (provider === 'stripe' && tenant.stripeSubscriptionId) {
      await cancelSubscription(tenantId)
    } else if (provider === 'paypal' && tenant.paypalSubscriptionId) {
      // PayPal cancellation — update DB directly; in production, call PayPal API
      await db.tenant.update({
        where: { id: tenantId },
        data: { subscriptionStatus: 'cancelled' },
      })
      await db.subscription.updateMany({
        where: { tenantId, status: 'active' },
        data: { status: 'cancelled', autoRenew: false },
      })
    } else {
      return apiError('No active subscription found to cancel', 400)
    }

    return apiResponse({ message: 'Subscription cancelled successfully' })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
