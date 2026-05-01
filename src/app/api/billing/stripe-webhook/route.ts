import { NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/billing/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    const result = await handleWebhook(body, signature)

    if (!result.received) {
      return NextResponse.json(
        { success: false, error: result.error || 'Webhook processing failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, received: true })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
