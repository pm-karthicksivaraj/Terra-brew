import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    const {
      commodity,
      price,
      currency = 'USD',
      change = 0,
      changePercent = 0,
      unit = 'per lb',
      source,
      high52w,
      low52w,
      isActive = true,
    } = body

    if (!commodity || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'commodity and price are required' },
        { status: 400 }
      )
    }

    const ticker = await db.priceTicker.create({
      data: {
        commodity,
        price: parseFloat(String(price)),
        currency,
        change: parseFloat(String(change)),
        changePercent: parseFloat(String(changePercent)),
        unit,
        source: source || null,
        high52w: high52w !== undefined ? parseFloat(String(high52w)) : null,
        low52w: low52w !== undefined ? parseFloat(String(low52w)) : null,
        isActive,
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
