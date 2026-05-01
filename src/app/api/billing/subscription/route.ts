import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'settings', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        paypalSubscriptionId: true,
        subscriptionPlanId: true,
        subscriptionStatus: true,
        subscriptionProvider: true,
        billingEmail: true,
      },
    })

    if (!tenant) {
      return apiError('Tenant not found', 404)
    }

    const subscription = await db.subscription.findUnique({
      where: { tenantId },
    })

    return apiResponse({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionProvider: tenant.subscriptionProvider,
        billingEmail: tenant.billingEmail,
      },
      subscription: subscription ? {
        id: subscription.id,
        planId: subscription.planId,
        planName: subscription.planName,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        trialEndDate: subscription.trialEndDate,
        maxUsers: subscription.maxUsers,
        maxFarmers: subscription.maxFarmers,
        maxFarmLands: subscription.maxFarmLands,
        storageLimitMb: subscription.storageLimitMb,
        apiCallsLimit: subscription.apiCallsLimit,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        autoRenew: subscription.autoRenew,
        lastPaymentDate: subscription.lastPaymentDate,
        nextPaymentDate: subscription.nextPaymentDate,
      } : null,
    })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
