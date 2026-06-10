/**
 * PayPal Billing Integration Library
 * 
 * Implements PayPal REST API v2 for order creation, capture, and subscription management.
 * Supports both one-time payments and recurring billing for the Terra Brew platform.
 * 
 * @see https://developer.paypal.com/api/orders/v2/
 * @see https://developer.paypal.com/api/subscriptions/v1/
 */

import { prisma } from '@/lib/prisma'

// ════════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════════

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || ''

// ════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════

export interface PayPalOrderParams {
  tenantId: string
  planSlug: string
  billingCycle: 'monthly' | 'yearly'
  amount: number
  currency: string
  description: string
  returnUrl: string
  cancelUrl: string
}

export interface PayPalSubscriptionParams {
  tenantId: string
  planId: string // PayPal plan ID
  planSlug: string
  billingCycle: 'monthly' | 'yearly'
  returnUrl: string
  cancelUrl: string
}

export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: { value: string; currency_code: string }
      }>
    }
  }>
}

export interface PayPalSubscriptionResponse {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource: Record<string, unknown>
}

// ════════════════════════════════════════════════════════════════
// Access Token Management
// ════════════════════════════════════════════════════════════════

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Obtains an access token from PayPal using client credentials.
 * Caches the token until near expiry.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() - 60000) {
    return cachedToken.token
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal auth failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  }

  return data.access_token
}

/**
 * Makes an authenticated request to the PayPal API.
 */
async function paypalRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  return response
}

// ════════════════════════════════════════════════════════════════
// Order (One-Time Payment) Endpoints
// ════════════════════════════════════════════════════════════════

/**
 * Creates a PayPal order for one-time payment.
 * 
 * @example
 * ```ts
 * const order = await createOrder({
 *   tenantId: 'abc123',
 *   planSlug: 'professional',
 *   billingCycle: 'monthly',
 *   amount: 299,
 *   currency: 'USD',
 *   description: 'Terra Brew Professional Plan - Monthly',
 *   returnUrl: 'https://example.com/billing?success=true',
 *   cancelUrl: 'https://example.com/billing?cancelled=true',
 * })
 * // Redirect user to order.links.find(l => l.rel === 'approve').href
 * ```
 */
export async function createOrder(params: PayPalOrderParams): Promise<PayPalOrderResponse> {
  const response = await paypalRequest('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.tenantId,
          description: params.description,
          custom_id: JSON.stringify({
            tenantId: params.tenantId,
            planSlug: params.planSlug,
            billingCycle: params.billingCycle,
          }),
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Terra Brew Coffee',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal create order failed: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Captures a previously approved PayPal order.
 * Called after the user approves the payment on PayPal's side.
 * 
 * @param orderId - The PayPal order ID returned after approval
 */
export async function captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const response = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal capture order failed: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Gets details of a PayPal order.
 */
export async function getOrder(orderId: string): Promise<PayPalOrderResponse> {
  const response = await paypalRequest(`/v2/checkout/orders/${orderId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal get order failed: ${response.status} - ${error}`)
  }

  return response.json()
}

// ════════════════════════════════════════════════════════════════
// Subscription Endpoints
// ════════════════════════════════════════════════════════════════

/**
 * Creates a PayPal subscription using a pre-defined PayPal plan.
 * 
 * @example
 * ```ts
 * const subscription = await createSubscription({
 *   tenantId: 'abc123',
 *   planId: 'P-5ML4271244454362WXNWU5NQ',
 *   planSlug: 'professional',
 *   billingCycle: 'monthly',
 *   returnUrl: 'https://example.com/billing?success=true',
 *   cancelUrl: 'https://example.com/billing?cancelled=true',
 * })
 * ```
 */
export async function createSubscription(
  params: PayPalSubscriptionParams,
): Promise<PayPalSubscriptionResponse> {
  // Get or create PayPal customer
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.tenantId },
    select: { name: true, whiteLabelConfig: true },
  })

  const subscriber: Record<string, unknown> = {}
  const paypalCustomerId = (tenant?.whiteLabelConfig ? JSON.parse(tenant.whiteLabelConfig).paypalCustomerId : null)
  if (paypalCustomerId) {
    subscriber.payer_id = paypalCustomerId
  }

  const response = await paypalRequest('/v1/billing/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: params.planId,
      custom_id: JSON.stringify({
        tenantId: params.tenantId,
        planSlug: params.planSlug,
        billingCycle: params.billingCycle,
      }),
      subscriber,
      application_context: {
        brand_name: 'Terra Brew Coffee',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal create subscription failed: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Save PayPal customer ID if this is a new subscriber (store in whiteLabelConfig JSON)
  if (data.subscriber?.payer_id && tenant) {
    const existingConfig = tenant.whiteLabelConfig ? JSON.parse(tenant.whiteLabelConfig) : {}
    if (!existingConfig.paypalCustomerId) {
      existingConfig.paypalCustomerId = data.subscriber.payer_id
      await prisma.tenant.update({
        where: { id: params.tenantId },
        data: { whiteLabelConfig: JSON.stringify(existingConfig) },
      })
    }
  }

  return data
}

/**
 * Cancels a PayPal subscription.
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason: string = 'User requested cancellation',
): Promise<void> {
  const response = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal cancel subscription failed: ${response.status} - ${error}`)
  }
}

/**
 * Gets details of a PayPal subscription.
 */
export async function getSubscription(subscriptionId: string): Promise<Record<string, unknown>> {
  const response = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal get subscription failed: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Suspends a PayPal subscription.
 */
export async function suspendSubscription(
  subscriptionId: string,
  reason: string = 'Payment issue',
): Promise<void> {
  const response = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal suspend subscription failed: ${response.status} - ${error}`)
  }
}

/**
 * Reactivates a suspended PayPal subscription.
 */
export async function reactivateSubscription(
  subscriptionId: string,
  reason: string = 'Reactivating subscription',
): Promise<void> {
  const response = await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal reactivate subscription failed: ${response.status} - ${error}`)
  }
}

// ════════════════════════════════════════════════════════════════
// Webhook Verification
// ════════════════════════════════════════════════════════════════

/**
 * Verifies a PayPal webhook signature to ensure the event is authentic.
 * 
 * @param headers - The incoming request headers
 * @param body - The raw request body
 * @returns Whether the webhook signature is valid
 */
export async function verifyWebhookSignature(
  headers: Headers,
  body: string,
): Promise<boolean> {
  const authAlgo = headers.get('PAYPAL-TRANSMISSION-SIG-ALGO')
  const certUrl = headers.get('PAYPAL-CERT-URL')
  const transmissionId = headers.get('PAYPAL-TRANSMISSION-ID')
  const transmissionSig = headers.get('PAYPAL-TRANSMISSION-SIG')
  const transmissionTime = headers.get('PAYPAL-TRANSMISSION-TIME')

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    console.error('[PayPal Webhook] Missing required headers for verification')
    return false
  }

  try {
    const token = await getAccessToken()
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    })

    if (!response.ok) {
      console.error('[PayPal Webhook] Verification request failed:', response.status)
      return false
    }

    const data = await response.json()
    return data.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('[PayPal Webhook] Verification error:', error)
    return false
  }
}

/**
 * Processes a PayPal webhook event and updates the local database.
 */
export async function handleWebhookEvent(event: PayPalWebhookEvent): Promise<void> {
  console.log(`[PayPal Webhook] Processing event: ${event.event_type}`)

  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED': {
      // Order approved by buyer — can now capture
      console.log('[PayPal Webhook] Order approved, ready for capture')
      break
    }

    case 'PAYMENT.CAPTURE.COMPLETED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handlePaymentSuccess(metadata.tenantId, metadata.planSlug, metadata.billingCycle)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handlePaymentFailure(metadata.tenantId)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handleSubscriptionActivated(metadata.tenantId, resource.id as string, metadata.planSlug, metadata.billingCycle)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handleSubscriptionCancelled(metadata.tenantId)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    case 'BILLING.SUBSCRIPTION.SUSPENDED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handleSubscriptionSuspended(metadata.tenantId)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
      const resource = event.resource as Record<string, unknown>
      const customId = resource.custom_id as string | undefined
      if (customId) {
        try {
          const metadata = JSON.parse(customId)
          await handlePaymentFailure(metadata.tenantId)
        } catch {
          console.error('[PayPal Webhook] Failed to parse custom_id:', customId)
        }
      }
      break
    }

    default:
      console.warn(`[PayPal Webhook] Unhandled event type: ${event.event_type}`)
  }
}

// ════════════════════════════════════════════════════════════════
// Internal Handlers
// ════════════════════════════════════════════════════════════════

async function handlePaymentSuccess(
  tenantId: string,
  planSlug: string,
  billingCycle: string,
): Promise<void> {
  // Get plan config from Stripe module (same plans used for both Stripe and PayPal)
  const { getPlanBySlug } = await import('@/lib/stripe')
  const plan = getPlanBySlug(planSlug)
  if (!plan) {
    console.error(`[PayPal] Unknown plan slug: ${planSlug}`)
    return
  }

  const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly

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
      features: JSON.stringify(plan.features),
      amount,
      currency: plan.currency,
      billingCycle: billingCycle as 'monthly' | 'yearly',
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
      features: JSON.stringify(plan.features),
      amount,
      currency: plan.currency,
      billingCycle: billingCycle as 'monthly' | 'yearly',
      lastPaymentDate: new Date(),
      isActive: true,
    },
  })

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      plan: planSlug,
      maxUsers: plan.limits.maxUsers,
      maxFarmers: plan.limits.maxFarmers,
    },
  })
}

async function handlePaymentFailure(tenantId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { tenantId },
    data: { status: 'suspended' },
  })
}

async function handleSubscriptionActivated(
  tenantId: string,
  paypalSubscriptionId: string,
  planSlug: string,
  billingCycle: string,
): Promise<void> {
  const { getPlanBySlug } = await import('@/lib/stripe')
  const plan = getPlanBySlug(planSlug)
  if (!plan) return

  const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly

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
      features: JSON.stringify(plan.features),
      amount,
      currency: plan.currency,
      billingCycle: billingCycle as 'monthly' | 'yearly',
      lastPaymentDate: new Date(),
      isActive: true,
    },
    update: {
      status: 'active',
      isActive: true,
      lastPaymentDate: new Date(),
    },
  })
}

async function handleSubscriptionCancelled(tenantId: string): Promise<void> {
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

async function handleSubscriptionSuspended(tenantId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { tenantId },
    data: {
      status: 'suspended',
      isActive: false,
    },
  })
}
