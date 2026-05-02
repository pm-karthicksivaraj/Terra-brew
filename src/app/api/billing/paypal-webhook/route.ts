import { NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/billing/paypal'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      headers[key] = value
    })

    const result = await handleWebhook(headers, body)

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
