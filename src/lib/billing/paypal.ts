/**
 * PayPal Subscription Billing Module — Terra Brew Coffee Platform
 *
 * Handles PayPal orders, subscriptions, access tokens, and webhook processing.
 * Uses PAYPAL_SANDBOX env var to determine live vs sandbox base URL.
 */
import { db } from '@/lib/db'
import { SUBSCRIPTION_PLANS, type PlanId } from './stripe'

// ════════════════════════════════════════════════════════════════
// PAYPAL PLAN ID MAPPING (from env vars)
// ════════════════════════════════════════════════════════════════

const PAYPAL_PLAN_IDS: Record<PlanId, string> = {
  starter: process.env.PAYPAL_STARTER_PLAN_ID || 'P-starter-placeholder',
  professional: process.env.PAYPAL_PROFESSIONAL_PLAN_ID || 'P-professional-placeholder',
  enterprise: process.env.PAYPAL_ENTERPRISE_PLAN_ID || 'P-enterprise-placeholder',
}

// ════════════════════════════════════════════════════════════════
// BASE URL
// ════════════════════════════════════════════════════════════════

function getPayPalBaseUrl(): string {
  const useSandbox = process.env.PAYPAL_SANDBOX !== 'false' // default to sandbox
  return useSandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

// ════════════════════════════════════════════════════════════════
// ACCESS TOKEN CACHE
// ════════════════════════════════════════════════════════════════

let _cachedToken: { token: string; expiresAt: number } | null = null

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface PayPalOrderResult {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalCaptureResult {
  id: string
  status: string
  purchase_units: Array<{
    payments: {
      captures: Array<{ id: string; status: string; amount: { value: string; currency_code: string }; custom_id?: string }>
    }
  }>
}

export interface PayPalSubscriptionResult {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalWebhookResult {
  received: boolean
  error?: string
}

// ════════════════════════════════════════════════════════════════
// GET ACCESS TOKEN
// ════════════════════════════════════════════════════════════════

export async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (_cachedToken && _cachedToken.expiresAt > Date.now() + 60_000) {
    return _cachedToken.token
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured (NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)')
  }

  const base = getPayPalBaseUrl()
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`PayPal auth error (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const expiresIn: number = data.expires_in || 3600

  _cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  return data.access_token
}

// ════════════════════════════════════════════════════════════════
// CREATE ORDER (One-time payment)
// ════════════════════════════════════════════════════════════════

export async function createOrder(
  params: { tenantId: string; planId: PlanId }
): Promise<PayPalOrderResult> {
  const { tenantId, planId } = params
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) throw new Error(`Invalid plan: ${planId}`)

  const accessToken = await getPayPalAccessToken()
  const base = getPayPalBaseUrl()

  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: plan.currency.toUpperCase(),
            value: plan.price.toFixed(2),
          },
          description: `Terra Brew ${plan.name} Plan — Monthly Subscription`,
          custom_id: `${tenantId}:${planId}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`PayPal create order error (${response.status}): ${errorBody}`)
  }

  return response.json()
}

// ════════════════════════════════════════════════════════════════
// CAPTURE ORDER
// ════════════════════════════════════════════════════════════════

export async function captureOrder(
  orderId: string
): Promise<PayPalCaptureResult> {
  const accessToken = await getPayPalAccessToken()
  const base = getPayPalBaseUrl()

  const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`PayPal capture order error (${response.status}): ${errorBody}`)
  }

  const data: PayPalCaptureResult = await response.json()

  // If capture completed, update tenant subscription
  if (data.status === 'COMPLETED') {
    const customId = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
    if (customId) {
      const [tenantId, planId] = customId.split(':')
      if (tenantId && planId && planId in SUBSCRIPTION_PLANS) {
        const plan = SUBSCRIPTION_PLANS[planId as PlanId]
        await db.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: 'active',
            subscriptionProvider: 'paypal',
            plan: planId,
            subscriptionPlanId: planId,
            maxUsers: plan.features.maxUsers,
            maxFarmers: plan.features.maxFarmers,
          },
        })
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
            lastPaymentDate: new Date(),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      }
    }
  }

  return data
}

// ════════════════════════════════════════════════════════════════
// CREATE SUBSCRIPTION (Recurring)
// ════════════════════════════════════════════════════════════════

export async function createSubscription(
  params: { tenantId: string; planId: PlanId; returnUrl: string; cancelUrl: string }
): Promise<PayPalSubscriptionResult> {
  const { tenantId, planId, returnUrl, cancelUrl } = params
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) throw new Error(`Invalid plan: ${planId}`)

  const accessToken = await getPayPalAccessToken()
  const base = getPayPalBaseUrl()
  const paypalPlanId = PAYPAL_PLAN_IDS[planId]

  const response = await fetch(`${base}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'PayPal-Request-Id': `sub-${tenantId}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: paypalPlanId,
      subscriber: {
        custom_id: tenantId,
      },
      application_context: {
        brand_name: 'Terra Brew Coffee',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`PayPal create subscription error (${response.status}): ${errorBody}`)
  }

  const data: PayPalSubscriptionResult = await response.json()

  if (data.id) {
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        paypalSubscriptionId: data.id,
        subscriptionProvider: 'paypal',
      },
    })
  }

  return data
}

// ════════════════════════════════════════════════════════════════
// HANDLE WEBHOOK
// ════════════════════════════════════════════════════════════════

export async function handleWebhook(
  headers: Record<string, string>,
  body: string
): Promise<PayPalWebhookResult> {
  // Parse the event body
  let event: {
    event_type: string
    resource: {
      id?: string
      subscriber?: { custom_id?: string }
      custom_id?: string
      billing_agreement_id?: string
    }
  }

  try {
    event = JSON.parse(body)
  } catch {
    return { received: false, error: 'Invalid webhook body' }
  }

  // In production, verify the webhook signature using PayPal's verification API
  // For now, we verify via headers presence
  const transmissionId = headers['paypal-transmission-id']
  if (!transmissionId && process.env.NODE_ENV === 'production') {
    return { received: false, error: 'Missing PayPal webhook verification headers' }
  }

  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = event.resource.id
        const tenantId = event.resource.subscriber?.custom_id
        if (tenantId) {
          await db.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionStatus: 'active',
              subscriptionProvider: 'paypal',
              paypalSubscriptionId: subscriptionId,
            },
          })
          await db.subscription.updateMany({
            where: { tenantId },
            data: { status: 'active', lastPaymentDate: new Date() },
          })
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const tenantId = event.resource.subscriber?.custom_id
        if (tenantId) {
          await db.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionStatus: 'cancelled',
            },
          })
          await db.subscription.updateMany({
            where: { tenantId },
            data: { status: 'cancelled' },
          })
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const tenantId = event.resource.subscriber?.custom_id
        if (tenantId) {
          await db.tenant.update({
            where: { id: tenantId },
            data: { subscriptionStatus: 'past_due' },
          })
          await db.subscription.updateMany({
            where: { tenantId },
            data: { status: 'suspended' },
          })
        }
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const customId = event.resource.custom_id
        const billingAgreementId = event.resource.billing_agreement_id
        const lookupId = customId || billingAgreementId

        if (lookupId) {
          // Try by tenant ID (custom_id) first, then by PayPal subscription ID
          const tenant =
            (await db.tenant.findUnique({ where: { id: lookupId } })) ||
            (await db.tenant.findFirst({ where: { paypalSubscriptionId: lookupId } }))

          if (tenant) {
            await db.subscription.updateMany({
              where: { tenantId: tenant.id },
              data: {
                lastPaymentDate: new Date(),
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            })
          }
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
