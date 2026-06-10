import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateData, priceTickerSchema } from '@/lib/validations'

/**
 * GET /api/price-tickers — List all price tickers
 * POST /api/price-tickers — Create a new price ticker
 */

export async function GET() {
  try {
    const tickers = await db.priceTicker.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: { tickers } })
  } catch (e: any) {
    console.error('[PriceTickers API] GET error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price tickers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = validateData(priceTickerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors?.issues },
        { status: 400 }
      )
    }
    const validatedData = validation.data!

    const ticker = await db.priceTicker.create({
      data: {
        commodity: validatedData.commodity,
        price: validatedData.price,
        currency: validatedData.currency,
        change: validatedData.change,
        changePercent: validatedData.changePercent,
        unit: validatedData.unit,
        source: validatedData.source || null,
        high52w: validatedData.high52w ?? null,
        low52w: validatedData.low52w ?? null,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({ success: true, data: { ticker } }, { status: 201 })
  } catch (e: any) {
    console.error('[PriceTickers API] POST error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to create price ticker' },
      { status: 500 }
    )
  }
}
