import { NextResponse } from 'next/server'
import { constructEventFromBody, handleWebhookEvent } from '@/lib/stripe'

/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook endpoint. Receives events directly from Stripe
 * (no authentication middleware — Stripe signs requests itself).
 *
 * IMPORTANT: The raw body must be used for signature verification.
 * Do NOT parse the body as JSON before verifying the signature.
 */
export async function POST(request: Request) {
  try {
    // Read the raw body as text (required for signature verification)
    const body = await request.text()

    // Get the Stripe signature from the header
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 },
      )
    }

    // Verify the webhook signature and construct the event
    let event
    try {
      event = constructEventFromBody(body, signature)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature'
      console.error('[Stripe Webhook] Signature verification failed:', message)
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${message}` },
        { status: 400 },
      )
    }

    // Process the event
    await handleWebhookEvent(event)

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed'
    console.error('[Stripe Webhook] Handler error:', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
