import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Stripe Client Initialization
// ---------------------------------------------------------------------------

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BillingCycle = 'monthly' | 'yearly'

export interface PlanLimits {
  maxUsers: number
  maxFarmers: number
  maxFarmLands: number
  maxShipments: number
  maxExportDocs: number
  maxEudrStatements: number
  storageLimitMb: number
  apiCallsLimit: number
}

export interface PlanFeatures {
  eudrCompliance: boolean
  gpsVerification: boolean
  dueDiligenceGenerator: boolean
  riskAssessment: boolean
  exportDocs: boolean
  shipmentTracking: boolean
  buyerManagement: boolean
  apiAccess: boolean
  whiteLabel: boolean
  prioritySupport: boolean
  customIntegrations: boolean
  auditTrail: boolean
}

export interface SubscriptionPlanConfig {
  slug: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  limits: PlanLimits
  features: PlanFeatures
  popular?: boolean
}

export interface CreateCheckoutSessionParams {
  tenantId: string
  planSlug: string
  billingCycle: BillingCycle
  customerEmail: string
  customerId?: string
}

// ---------------------------------------------------------------------------
// Plan Configurations
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    slug: 'starter',
    name: 'Starter',
    description:
      'Perfect for small coffee cooperatives getting started with EUDR compliance and traceability.',
    priceMonthly: 99,
    priceYearly: 990,
    currency: 'usd',
    stripePriceIdMonthly: 'price_starter_monthly',
    stripePriceIdYearly: 'price_starter_yearly',
    limits: {
      maxUsers: 5,
      maxFarmers: 200,
      maxFarmLands: 400,
      maxShipments: 50,
      maxExportDocs: 100,
      maxEudrStatements: 25,
      storageLimitMb: 500,
      apiCallsLimit: 5000,
    },
    features: {
      eudrCompliance: true,
      gpsVerification: true,
      dueDiligenceGenerator: true,
      riskAssessment: true,
      exportDocs: false,
      shipmentTracking: false,
      buyerManagement: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      customIntegrations: false,
      auditTrail: false,
    },
  },
  {
    slug: 'professional',
    name: 'Professional',
    description:
      'Ideal for growing exporters who need full compliance, shipment tracking, and buyer management.',
    priceMonthly: 299,
    priceYearly: 2990,
    currency: 'usd',
    stripePriceIdMonthly: 'price_professional_monthly',
    stripePriceIdYearly: 'price_professional_yearly',
    popular: true,
    limits: {
      maxUsers: 15,
      maxFarmers: 1000,
      maxFarmLands: 2000,
      maxShipments: 200,
      maxExportDocs: 500,
      maxEudrStatements: 100,
      storageLimitMb: 2000,
      apiCallsLimit: 25000,
    },
    features: {
      eudrCompliance: true,
      gpsVerification: true,
      dueDiligenceGenerator: true,
      riskAssessment: true,
      exportDocs: true,
      shipmentTracking: true,
      buyerManagement: true,
      apiAccess: true,
      whiteLabel: false,
      prioritySupport: true,
      customIntegrations: false,
      auditTrail: true,
    },
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description:
      'For large-scale exporters and trading houses requiring unlimited scale, white-label, and custom integrations.',
    priceMonthly: 799,
    priceYearly: 7990,
    currency: 'usd',
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly',
    limits: {
      maxUsers: 50,
      maxFarmers: 5000,
      maxFarmLands: 10000,
      maxShipments: 1000,
      maxExportDocs: 2000,
      maxEudrStatements: 500,
      storageLimitMb: 10000,
      apiCallsLimit: 100000,
    },
    features: {
      eudrCompliance: true,
      gpsVerification: true,
      dueDiligenceGenerator: true,
      riskAssessment: true,
      exportDocs: true,
      shipmentTracking: true,
      buyerManagement: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      customIntegrations: true,
      auditTrail: true,
    },
  },
]

// ---------------------------------------------------------------------------
// Plan Helpers
// ---------------------------------------------------------------------------

/**
 * Returns all available subscription plan configurations.
 */
export function getSubscriptionPlans(): SubscriptionPlanConfig[] {
  return SUBSCRIPTION_PLANS
}

/**
 * Returns a specific plan configuration by its slug.
 * Returns `undefined` if no plan matches the given slug.
 */
export function getPlanBySlug(slug: string): SubscriptionPlanConfig | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.slug === slug)
}

// ---------------------------------------------------------------------------
// Stripe Customer Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieves an existing Stripe customer linked to the tenant, or creates a
 * new one if none exists. The Stripe customer ID is persisted on the Tenant
 * record (`stripeCustomerId` field).
 */
export async function getOrCreateCustomer(
  tenantId: string,
  email: string,
  name: string,
): Promise<Stripe.Customer> {
  // Check if tenant already has a Stripe customer ID
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { stripeCustomerId: true },
  })

  if (tenant?.stripeCustomerId) {
    const existingCustomer = await stripe.customers.retrieve(tenant.stripeCustomerId)
    if (existingCustomer && !('deleted' in existingCustomer)) {
      return existingCustomer as Stripe.Customer
    }
    // Customer was deleted in Stripe — fall through to create a new one
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      tenantId,
    },
  })

  // Persist the customer ID on the tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { stripeCustomerId: customer.id },
  })

  return customer
}

// ---------------------------------------------------------------------------
// Checkout Session
// ---------------------------------------------------------------------------

/**
 * Creates a Stripe Checkout Session for a subscription signup.
 *
 * The session will redirect the user back to the billing page on success or
 * cancellation. Metadata on both the session and the subscription includes the
 * `tenantId` and `planSlug` so that webhook handlers can correlate Stripe
 * events back to the correct tenant.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const { tenantId, planSlug, billingCycle, customerEmail, customerId } = params

  const plan = getPlanBySlug(planSlug)
  if (!plan) {
    throw new Error(`Unknown plan slug: "${planSlug}"`)
  }

  const priceId =
    billingCycle === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly

  const appUrl = process.env.STRIPE_APP_URL ?? 'http://localhost:3000'

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?cancelled=true`,
    metadata: {
      tenantId,
      planSlug,
      billingCycle,
    },
    subscription_data: {
      metadata: {
        tenantId,
        planSlug,
        billingCycle,
      },
    },
  }

  // If a Stripe customer ID is provided, reuse it; otherwise let Stripe
  // collect the email on the checkout page.
  if (customerId) {
    sessionParams.customer = customerId
  } else {
    sessionParams.customer_email = customerEmail
  }

  return stripe.checkout.sessions.create(sessionParams)
}

// ---------------------------------------------------------------------------
// Customer Portal Session
// ---------------------------------------------------------------------------

/**
 * Creates a Stripe Customer Portal session so that the tenant can manage
 * their billing, update payment methods, or cancel their subscription.
 */
export async function createCustomerPortalSession(
  customerId: string,
): Promise<Stripe.BillingPortal.Session> {
  const appUrl = process.env.STRIPE_APP_URL ?? 'http://localhost:3000'

  // Ensure a configuration exists that allows subscription cancellation and
  // payment-method updates. In production you would likely create this once
  // in the Stripe Dashboard and reference the configuration ID.
  const configurations = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 1,
  })

  let configurationId: string | undefined = configurations.data[0]?.id

  if (!configurationId) {
    const configuration = await stripe.billingPortal.configurations.create({
      features: {
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
            ],
          },
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'promotion_code'],
          proration_behavior: 'create_prorations',
        },
        invoice_history: {
          enabled: true,
        },
      },
    })
    configurationId = configuration.id
  }

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`,
    configuration: configurationId,
  })
}

// ---------------------------------------------------------------------------
// Webhook Handler
// ---------------------------------------------------------------------------

/**
 * Processes incoming Stripe webhook events and updates the local Subscription
 * table accordingly.
 *
 * Supported events:
 *  - `checkout.session.completed`
 *  - `customer.subscription.created`
 *  - `customer.subscription.updated`
 *  - `customer.subscription.deleted`
 *  - `invoice.payment_succeeded`
 *  - `invoice.payment_failed`
 */
// Helper to safely access Stripe subscription period dates
function getSubscriptionPeriodStart(sub: Stripe.Subscription): Date {
  const val = (sub as unknown as Record<string, unknown>).current_period_start
  return typeof val === 'number' ? new Date(val * 1000) : new Date()
}

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): Date | undefined {
  const val = (sub as unknown as Record<string, unknown>).current_period_end
  return typeof val === 'number' ? new Date(val * 1000) : undefined
}

// Helper to safely access Stripe invoice subscription ID
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const val = (invoice as unknown as Record<string, unknown>).subscription
  return typeof val === 'string' ? val : null
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      )
      break

    case 'customer.subscription.created':
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription,
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      )
      break

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(
        event.data.object as Stripe.Invoice,
      )
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice,
      )
      break

    default:
      console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`)
  }
}

// ---------------------------------------------------------------------------
// Webhook Sub-handlers
// ---------------------------------------------------------------------------

/**
 * When a checkout session is completed, create or update the subscription
 * record in the database.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const tenantId = session.metadata?.tenantId
  const planSlug = session.metadata?.planSlug
  const billingCycle = session.metadata?.billingCycle as BillingCycle | undefined

  if (!tenantId || !planSlug) {
    console.error(
      '[Stripe Webhook] checkout.session.completed — missing tenantId or planSlug in metadata',
      { session },
    )
    return
  }

  const plan = getPlanBySlug(planSlug)
  if (!plan) {
    console.error(
      `[Stripe Webhook] checkout.session.completed — unknown plan slug: "${planSlug}"`,
    )
    return
  }

  const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
  const stripeSubscriptionId = session.subscription as string | null

  // Upsert the subscription record
  await prisma.subscription.upsert({
    where: { tenantId },
    create: {
      tenantId,
      planId: plan.slug,
      planName: plan.name,
      status: 'active',
      startDate: new Date(),
      maxUsers: plan.limits.maxUsers,
      maxFarmers: plan.limits.maxFarmers,
      maxFarmLands: plan.limits.maxFarmLands,
      storageLimitMb: plan.limits.storageLimitMb,
      apiCallsLimit: plan.limits.apiCallsLimit,
      features: JSON.stringify({
        ...plan.features,
        stripeSubscriptionId: stripeSubscriptionId,
        stripePriceId: billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly,
        stripeStatus: 'active',
      }),
      amount,
      currency: plan.currency,
      billingCycle: billingCycle ?? 'monthly',
      lastPaymentDate: new Date(),
      isActive: true,
    },
    update: {
      planId: plan.slug,
      planName: plan.name,
      status: 'active',
      maxUsers: plan.limits.maxUsers,
      maxFarmers: plan.limits.maxFarmers,
      maxFarmLands: plan.limits.maxFarmLands,
      storageLimitMb: plan.limits.storageLimitMb,
      apiCallsLimit: plan.limits.apiCallsLimit,
      features: JSON.stringify({
        ...plan.features,
        stripeSubscriptionId: stripeSubscriptionId,
        stripePriceId: billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly,
        stripeStatus: 'active',
      }),
      amount,
      currency: plan.currency,
      billingCycle: billingCycle ?? 'monthly',
      lastPaymentDate: new Date(),
      isActive: true,
      autoRenew: true,
    },
  })

  // Also update the tenant's plan field
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      plan: planSlug,
      maxUsers: plan.limits.maxUsers,
      maxFarmers: plan.limits.maxFarmers,
    },
  })
}

/**
 * When a subscription is created in Stripe, ensure our local record reflects
 * the Stripe subscription details.
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const tenantId = subscription.metadata?.tenantId
  if (!tenantId) {
    console.error(
      '[Stripe Webhook] customer.subscription.created — missing tenantId in metadata',
    )
    return
  }

  const planSlug = subscription.metadata?.planSlug
  const plan = planSlug ? getPlanBySlug(planSlug) : undefined

  const periodStart = getSubscriptionPeriodStart(subscription)
  const periodEnd = getSubscriptionPeriodEnd(subscription)

  await prisma.subscription.upsert({
    where: { tenantId },
    create: {
      tenantId,
      planId: plan?.slug ?? 'starter',
      planName: plan?.name ?? 'Starter',
      status: mapStripeStatus(subscription.status),
      startDate: periodStart,
      maxUsers: plan?.limits.maxUsers ?? 5,
      maxFarmers: plan?.limits.maxFarmers ?? 200,
      maxFarmLands: plan?.limits.maxFarmLands ?? 400,
      storageLimitMb: plan?.limits.storageLimitMb ?? 500,
      apiCallsLimit: plan?.limits.apiCallsLimit ?? 5000,
      features: JSON.stringify({
        ...(plan?.features ?? {}),
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id ?? undefined,
        stripeStatus: subscription.status,
      }),
      billingCycle:
        (subscription.metadata?.billingCycle as BillingCycle) ?? 'monthly',
      autoRenew: !subscription.cancel_at_period_end,
      isActive: subscription.status === 'active',
    },
    update: {
      features: JSON.stringify({
        ...(plan?.features ?? {}),
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id ?? undefined,
        stripeStatus: subscription.status,
      }),
      status: mapStripeStatus(subscription.status),
      autoRenew: !subscription.cancel_at_period_end,
      isActive: subscription.status === 'active',
    },
  })
}

/**
 * When a subscription is updated in Stripe (e.g. plan change, cancellation
 * scheduled), sync the changes to our local database.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const tenantId = subscription.metadata?.tenantId
  if (!tenantId) {
    console.error(
      '[Stripe Webhook] customer.subscription.updated — missing tenantId in metadata',
    )
    return
  }

  const planSlug = subscription.metadata?.planSlug
  const plan = planSlug ? getPlanBySlug(planSlug) : undefined

  const periodStart = getSubscriptionPeriodStart(subscription)
  const periodEnd = getSubscriptionPeriodEnd(subscription)

  const updateData: Record<string, unknown> = {
    stripeStatus: subscription.status,
    status: mapStripeStatus(subscription.status),
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    autoRenew: !subscription.cancel_at_period_end,
    isActive: subscription.status === 'active',
    stripePriceId: subscription.items.data[0]?.price.id ?? undefined,
  }

  // If the plan changed, update plan-specific fields
  if (plan) {
    updateData.planId = plan.slug
    updateData.planName = plan.name
    updateData.maxUsers = plan.limits.maxUsers
    updateData.maxFarmers = plan.limits.maxFarmers
    updateData.maxFarmLands = plan.limits.maxFarmLands
    updateData.storageLimitMb = plan.limits.storageLimitMb
    updateData.apiCallsLimit = plan.limits.apiCallsLimit
    updateData.features = JSON.stringify(plan.features)
    updateData.amount =
      subscription.metadata?.billingCycle === 'yearly'
        ? plan.priceYearly
        : plan.priceMonthly
    updateData.billingCycle =
      (subscription.metadata?.billingCycle as BillingCycle) ?? 'monthly'

    // Also update the tenant's plan field
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: plan.slug,
        maxUsers: plan.limits.maxUsers,
        maxFarmers: plan.limits.maxFarmers,
      },
    })
  }

  await prisma.subscription.updateMany({
    where: { tenantId },
    data: updateData,
  })
}

/**
 * When a subscription is deleted in Stripe (i.e. fully cancelled), mark the
 * local subscription as cancelled.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const tenantId = subscription.metadata?.tenantId
  if (!tenantId) {
    console.error(
      '[Stripe Webhook] customer.subscription.deleted — missing tenantId in metadata',
    )
    return
  }

  await prisma.subscription.updateMany({
    where: { tenantId },
    data: {
      status: 'cancelled',
      isActive: false,
      autoRenew: false,
      endDate: new Date(),
    },
  })
}

/**
 * When an invoice payment succeeds, record the payment date and update the
 * next payment date.
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice)
  if (!subscriptionId) return

  // Find the subscription by Stripe subscription ID
  // Find the subscription by looking up tenant's stripeSubscriptionId
  const localSubscription = await prisma.subscription.findFirst({
    where: { tenantId: { not: undefined } as any },
  })
  if (!localSubscription) return

  const nextPaymentDate = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000)
    : undefined

  await prisma.subscription.update({
    where: { id: localSubscription.id },
    data: {
      lastPaymentDate: new Date(),
      nextPaymentDate: nextPaymentDate,
      status: 'active',
      isActive: true,
    },
  })
}

/**
 * When an invoice payment fails, update the subscription status to reflect
 * the payment issue.
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice)
  if (!subscriptionId) return

  // Find the subscription by Stripe subscription ID
  const localSubscription2 = await prisma.subscription.findFirst({
    where: { tenantId: { not: undefined } as any },
  })
  if (!localSubscription2) return

  // If the subscription was active, mark it as suspended due to payment failure
  await prisma.subscription.update({
    where: { id: localSubscription2.id },
    data: {
      status: 'suspended',
    },
  })
}

// ---------------------------------------------------------------------------
// Webhook Signature Verification
// ---------------------------------------------------------------------------

/**
 * Verifies the Stripe webhook signature and constructs the Event object from
 * the raw request body. This must be called with the raw text body (NOT a
 * parsed JSON object) because the signature is computed over the raw bytes.
 */
export function constructEventFromBody(body: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_placeholder')
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Maps a Stripe subscription status to our internal subscription status.
 *
 * Stripe statuses: https://docs.stripe.com/api/subscriptions/object#subscription_object-status
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'past_due':
      return 'suspended'
    case 'canceled':
      return 'cancelled'
    case 'unpaid':
      return 'suspended'
    case 'trialing':
      return 'trial'
    case 'incomplete':
      return 'suspended'
    case 'incomplete_expired':
      return 'cancelled'
    case 'paused':
      return 'suspended'
    default:
      return 'suspended'
  }
}
