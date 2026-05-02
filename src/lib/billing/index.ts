/**
 * Billing Index Module — Terra Brew Coffee Platform
 *
 * Re-exports everything from stripe and paypal modules, plus provides
 * plan lookup, feature access checking, and plan feature retrieval.
 */
import { db } from '@/lib/db'
import {
  SUBSCRIPTION_PLANS,
  type PlanId,
  getStripe,
  createCheckoutSession,
  createCustomerPortalSession,
  handleWebhook as handleStripeWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from './stripe'

export {
  SUBSCRIPTION_PLANS,
  type PlanId,
  getStripe,
  createCheckoutSession,
  createCustomerPortalSession,
  handleStripeWebhook,
  getSubscriptionStatus,
  cancelSubscription,
}

export {
  getPayPalAccessToken,
  createOrder,
  captureOrder,
  createSubscription,
  handleWebhook as handlePayPalWebhook,
} from './paypal'

export type { PlanId as PayPalPlanId } from './stripe'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export type PlanFeatures = (typeof SUBSCRIPTION_PLANS)[PlanId]['features']

export interface TenantPlanInfo {
  planId: PlanId
  planName: string
  price: number
  currency: string
  interval: string
  status: string
  features: PlanFeatures
  subscriptionProvider: string | null
}

export interface FeatureAccessResult {
  hasAccess: boolean
  reason?: string
}

// ════════════════════════════════════════════════════════════════
// GET PLAN FOR TENANT
// ════════════════════════════════════════════════════════════════

export async function getPlanForTenant(
  tenantId: string
): Promise<TenantPlanInfo | null> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  })

  if (!tenant) return null

  const planId = (tenant.plan as PlanId) || 'starter'
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) return null

  // Use the subscription features if available, otherwise plan defaults
  let features = plan.features
  if (tenant.subscription?.features) {
    try {
      const storedFeatures = JSON.parse(tenant.subscription.features)
      features = { ...plan.features, ...storedFeatures }
    } catch {
      // Fall back to plan defaults
    }
  }

  return {
    planId,
    planName: plan.name,
    price: plan.price,
    currency: plan.currency,
    interval: plan.interval,
    status: tenant.subscriptionStatus || 'inactive',
    features,
    subscriptionProvider: tenant.subscriptionProvider,
  }
}

// ════════════════════════════════════════════════════════════════
// CHECK FEATURE ACCESS
// ════════════════════════════════════════════════════════════════

export async function checkFeatureAccess(
  tenantId: string,
  feature: string
): Promise<FeatureAccessResult> {
  const planInfo = await getPlanForTenant(tenantId)
  if (!planInfo) {
    return { hasAccess: false, reason: 'Tenant not found' }
  }

  // Check subscription is active
  if (planInfo.status !== 'active' && planInfo.status !== 'trialing') {
    return { hasAccess: false, reason: 'Subscription is not active' }
  }

  const features = planInfo.features as Record<string, unknown>
  const featureValue = features[feature]

  // Boolean features (e.g. shipments, buyers, apiAccess)
  if (typeof featureValue === 'boolean') {
    return {
      hasAccess: featureValue,
      reason: featureValue ? undefined : `Feature '${feature}' is not available on the ${planInfo.planName} plan`,
    }
  }

  // Numeric features with -1 meaning unlimited (e.g. maxUsers, maxFarmers)
  if (typeof featureValue === 'number') {
    return { hasAccess: true } // If it exists as a numeric limit, access is granted (limit checking is separate)
  }

  // Feature not found in plan definition
  return {
    hasAccess: false,
    reason: `Unknown feature: '${feature}'`,
  }
}

// ════════════════════════════════════════════════════════════════
// GET PLAN FEATURES
// ════════════════════════════════════════════════════════════════

export function getPlanFeatures(planId: PlanId): PlanFeatures {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) throw new Error(`Invalid plan: ${planId}`)
  return plan.features
}
