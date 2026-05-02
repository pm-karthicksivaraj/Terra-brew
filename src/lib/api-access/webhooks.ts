/**
 * Webhook Endpoint Management Module — Terra Brew Coffee Platform
 *
 * Webhook endpoint registration, event triggering, signature verification,
 * deletion, and listing. Uses HMAC-SHA256 for payload signing.
 */
import crypto from 'crypto'
import { db } from '@/lib/db'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface WebhookRegistration {
  id: string
  url: string
  events: string[]
  secret: string
}

export interface WebhookTriggerResult {
  delivered: number
  failed: number
}

export interface WebhookListItem {
  id: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: Date | null
  failureCount: number
  createdAt: Date
}

// ════════════════════════════════════════════════════════════════
// REGISTER WEBHOOK
// ════════════════════════════════════════════════════════════════

export async function registerWebhook(
  tenantId: string,
  url: string,
  events: string[]
): Promise<WebhookRegistration> {
  const secret = generateWebhookSecret()

  const endpoint = await db.webhookEndpoint.create({
    data: {
      tenantId,
      url,
      events: JSON.stringify(events),
      secret,
    },
  })

  return {
    id: endpoint.id,
    url: endpoint.url,
    events,
    secret: endpoint.secret,
  }
}

// ════════════════════════════════════════════════════════════════
// TRIGGER WEBHOOK
// ════════════════════════════════════════════════════════════════

export async function triggerWebhook(
  event: string,
  tenantId: string,
  payload: Record<string, unknown>
): Promise<WebhookTriggerResult> {
  const endpoints = await db.webhookEndpoint.findMany({
    where: {
      tenantId,
      isActive: true,
    },
  })

  let delivered = 0
  let failed = 0

  for (const endpoint of endpoints) {
    const events: string[] = JSON.parse(endpoint.events || '[]')
    // Only trigger for matching events or wildcard subscriptions
    if (!events.includes(event) && !events.includes('*')) continue

    try {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      })

      const signature = signWebhookPayload(body, endpoint.secret)

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TerraBrew-Signature': signature,
          'X-TerraBrew-Event': event,
          'X-TerraBrew-Delivery': crypto.randomBytes(16).toString('hex'),
        },
        body,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (response.ok) {
        delivered++
        await db.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: { lastTriggeredAt: new Date(), failureCount: 0 },
        })
      } else {
        failed++
        await db.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: { failureCount: { increment: 1 } },
        })
      }
    } catch {
      failed++
      await db.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: { failureCount: { increment: 1 } },
      })
    }
  }

  return { delivered, failed }
}

// ════════════════════════════════════════════════════════════════
// VERIFY WEBHOOK SIGNATURE
// ════════════════════════════════════════════════════════════════

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = signWebhookPayload(payload, secret)

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch {
    return false
  }
}

// ════════════════════════════════════════════════════════════════
// DELETE WEBHOOK (soft-delete)
// ════════════════════════════════════════════════════════════════

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    const webhook = await db.webhookEndpoint.findUnique({
      where: { id: webhookId },
    })
    if (!webhook) return false

    // Soft-delete by setting isActive to false
    await db.webhookEndpoint.update({
      where: { id: webhookId },
      data: { isActive: false },
    })

    return true
  } catch {
    return false
  }
}

// ════════════════════════════════════════════════════════════════
// LIST WEBHOOKS
// ════════════════════════════════════════════════════════════════

export async function listWebhooks(tenantId: string): Promise<WebhookListItem[]> {
  const endpoints = await db.webhookEndpoint.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })

  return endpoints.map(endpoint => ({
    id: endpoint.id,
    url: endpoint.url,
    events: JSON.parse(endpoint.events || '[]'),
    isActive: endpoint.isActive,
    lastTriggeredAt: endpoint.lastTriggeredAt,
    failureCount: endpoint.failureCount,
    createdAt: endpoint.createdAt,
  }))
}

// ════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════

function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`
}

function signWebhookPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}
