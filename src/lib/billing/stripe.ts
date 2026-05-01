/**
 * Stripe Subscription Billing Module — Terra Brew Coffee Platform
 *
 * Handles subscription checkout, customer portal, webhook processing,
 * and subscription lifecycle management via Stripe.
 * Lazy-initializes the Stripe client and returns null if not configured.
 */
import Stripe from 'stripe'
import { db } from '@/lib/db'

// ════════════════════════════════════════════════════════════════
// PLAN DEFINITIONS
// ════════════════════════════════════════════════════════════════

export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 99,
    currency: 'usd',
    interval: 'month' as const,
    features: {
      maxUsers: 10,
      maxFarmers: 500,
      maxFarmLands: 1000,
      apiCallsLimit: 10000,
      storageLimitMb: 500,
      eudrCompliance: true,
      exportDocs: true,
      shipments: false,
      buyers: false,
      tradingDesk: false,
      apiAccess: false,
      deforestationAssessment: false,
      whiteLabel: false,
      iotTracking: false,
      complianceMarketplace: false,
      advancedAnalytics: false,
      multiOrigin: false,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 299,
    currency: 'usd',
    interval: 'month' as const,
    features: {
      maxUsers: 50,
      maxFarmers: 5000,
      maxFarmLands: 10000,
      apiCallsLimit: 100000,
      storageLimitMb: 5000,
      eudrCompliance: true,
      exportDocs: true,
      shipments: true,
      buyers: true,
      tradingDesk: true,
      apiAccess: false,
      deforestationAssessment: true,
      whiteLabel: false,
      iotTracking: true,
      complianceMarketplace: true,
      advancedAnalytics: true,
      multiOrigin: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    currency: 'usd',
    interval: 'month' as const,
    features: {
      maxUsers: -1, // unlimited
      maxFarmers: -1,
      maxFarmLands: -1,
      apiCallsLimit: -1,
      storageLimitMb: -1,
      eudrCompliance: true,
      exportDocs: true,
      shipments: true,
      buyers: true,
      tradingDesk: true,
      apiAccess: true,
      deforestationAssessment: true,
      whiteLabel: true,
      iotTracking: true,
      complianceMarketplace: true,
      advancedAnalytics: true,
      multiOrigin: true,
    },
  },
} as const

export type PlanId = keyof typeof SUBSCRIPTION_PLANS

// ════════════════════════════════════════════════════════════════
// STRIPE PRICE ID MAPPING (from env vars)
// ════════════════════════════════════════════════════════════════

const STRIPE_PRICE_IDS: Record<PlanId, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_placeholder',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
}

// ════════════════════════════════════════════════════════════════
// LAZY STRIPE INSTANCE
// ════════════════════════════════════════════════════════════════

let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }
  if (!_stripe) {
    _stripe = new Stripe(secretKey, {
      typescript: true,
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface CheckoutSessionParams {
  tenantId: string
  planId: PlanId
  email: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSessionResult {
  url: string | null
  sessionId: string
}

export interface PortalSessionParams {
  tenantId: string
  returnUrl: string
}

export interface PortalSessionResult {
  url: string
}

export interface SubscriptionStatusResult {
  status: string
  plan: string
  provider: string | null
  stripeSubscriptionId: string | null
  subscription: {
    id: string
    planId: string
    planName: string
    status: string
    startDate: Date
    endDate: Date | null
    amount: number | null
    currency: string | null
    billingCycle: string | null
    lastPaymentDate: Date | null
    nextPaymentDate: Date | null
  } | null
}

export interface WebhookResult {
  received: boolean
  error?: string
}

// ════════════════════════════════════════════════════════════════
// CREATE CHECKOUT SESSION
// ════════════════════════════════════════════════════════════════

export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { tenantId, planId, email, successUrl, cancelUrl } = params
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) throw new Error(`Invalid plan: ${planId}`)

  const priceId = STRIPE_PRICE_IDS[planId]

  // Get or create Stripe customer
  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw new Error('Tenant not found')

  let customerId = tenant.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { tenantId },
    })
    customerId = customer.id
    await db.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId, billingEmail: email },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenantId, planId },
    subscription_data: {
      metadata: { tenantId, planId },
    },
  })

  return { url: session.url, sessionId: session.id }
}

// ════════════════════════════════════════════════════════════════
// CREATE CUSTOMER PORTAL SESSION
// ════════════════════════════════════════════════════════════════

export async function createCustomerPortalSession(
  params: PortalSessionParams
): Promise<PortalSessionResult> {
  const { tenantId, returnUrl } = params
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this tenant')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}

// ════════════════════════════════════════════════════════════════
// HANDLE WEBHOOK
// ════════════════════════════════════════════════════════════════

export async function handleWebhook(
  body: string,
  signature: string
): Promise<WebhookResult> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown webhook signature error'
    return { received: false, error: message }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const tenantId = session.metadata?.tenantId
        const planId = session.metadata?.planId as PlanId | undefined
        if (tenantId && planId && planId in SUBSCRIPTION_PLANS) {
          const subscriptionId = session.subscription as string
          const plan = SUBSCRIPTION_PLANS[planId]

          await db.tenant.update({
            where: { id: tenantId },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              subscriptionProvider: 'stripe',
              plan: planId,
              subscriptionPlanId: planId,
              maxUsers: plan.features.maxUsers,
              maxFarmers: plan.features.maxFarmers,
            },
          })

          // Upsert subscription record
          await db.subscription.upsert({
            where: { tenantId },
            create: {
              tenantId,
              planId,
              planName: plan.name,
              status: 'active',
              startDate: new Date(),
              maxUsers: plan.features.maxUsers,
              maxFarmers: plan.features.maxFarmers,
              maxFarmLands: plan.features.maxFarmLands,
              storageLimitMb: plan.features.storageLimitMb,
              apiCallsLimit: plan.features.apiCallsLimit,
              features: JSON.stringify(plan.features),
              amount: plan.price,
              currency: plan.currency,
              billingCycle: 'monthly',
              lastPaymentDate: new Date(),
              nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            update: {
              planId,
              planName: plan.name,
              status: 'active',
              maxUsers: plan.features.maxUsers,
              maxFarmers: plan.features.maxFarmers,
              maxFarmLands: plan.features.maxFarmLands,
              storageLimitMb: plan.features.storageLimitMb,
              apiCallsLimit: plan.features.apiCallsLimit,
              features: JSON.stringify(plan.features),
              amount: plan.price,
              currency: plan.currency,
              lastPaymentDate: new Date(),
              nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenantId
        if (tenantId) {
          const newStatus =
            subscription.status === 'active'
              ? 'active'
              : subscription.cancel_at_period_end
                ? 'cancelled'
                : subscription.status

          await db.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionStatus: newStatus,
            },
          })

          const dbStatus =
            subscription.status === 'active'
              ? 'active'
              : subscription.cancel_at_period_end
                ? 'cancelled'
                : 'suspended'

          await db.subscription.updateMany({
            where: { tenantId },
            data: { status: dbStatus },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenantId
        if (tenantId) {
          await db.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionStatus: 'inactive',
              stripeSubscriptionId: null,
            },
          })
          await db.subscription.updateMany({
            where: { tenantId },
            data: { status: 'cancelled' },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const tenant = await db.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (tenant) {
          await db.tenant.update({
            where: { id: tenant.id },
            data: { subscriptionStatus: 'past_due' },
          })
          await db.subscription.updateMany({
            where: { tenantId: tenant.id },
            data: { status: 'suspended' },
          })
        }
        break
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook handler error'
    return { received: true, error: message }
  }

  return { received: true }
}

// ════════════════════════════════════════════════════════════════
// GET SUBSCRIPTION STATUS
// ════════════════════════════════════════════════════════════════

export async function getSubscriptionStatus(
  tenantId: string
): Promise<SubscriptionStatusResult> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  })
  if (!tenant) throw new Error('Tenant not found')

  return {
    status: tenant.subscriptionStatus || 'inactive',
    plan: tenant.plan,
    provider: tenant.subscriptionProvider,
    stripeSubscriptionId: tenant.stripeSubscriptionId,
    subscription: tenant.subscription
      ? {
          id: tenant.subscription.id,
          planId: tenant.subscription.planId,
          planName: tenant.subscription.planName,
          status: tenant.subscription.status,
          startDate: tenant.subscription.startDate,
          endDate: tenant.subscription.endDate,
          amount: tenant.subscription.amount,
          currency: tenant.subscription.currency,
          billingCycle: tenant.subscription.billingCycle,
          lastPaymentDate: tenant.subscription.lastPaymentDate,
          nextPaymentDate: tenant.subscription.nextPaymentDate,
        }
      : null,
  }
}

// ════════════════════════════════════════════════════════════════
// CANCEL SUBSCRIPTION
// ════════════════════════════════════════════════════════════════

export async function cancelSubscription(tenantId: string): Promise<void> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant?.stripeSubscriptionId) {
    throw new Error('No active Stripe subscription found')
  }

  // Cancel at period end so the tenant retains access until the end of the billing cycle
  await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  await db.tenant.update({
    where: { id: tenantId },
    data: { subscriptionStatus: 'cancelled' },
  })
}
