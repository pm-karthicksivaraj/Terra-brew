import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/price-tickers/[id] — Get a single price ticker
 * PUT /api/price-tickers/[id] — Update a price ticker
 * DELETE /api/price-tickers/[id] — Delete (soft) a price ticker
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ticker = await db.priceTicker.findUnique({ where: { id } })
    if (!ticker) {
      return NextResponse.json(
        { success: false, error: 'Price ticker not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: { ticker } })
  } catch (e: any) {
    console.error('[PriceTickers API] GET by ID error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price ticker' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      commodity,
      price,
      currency,
      change,
      changePercent,
      unit,
      source,
      high52w,
      low52w,
      isActive,
    } = body

    const existing = await db.priceTicker.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Price ticker not found' },
        { status: 404 }
      )
    }

    const ticker = await db.priceTicker.update({
      where: { id },
      data: {
        ...(commodity !== undefined && { commodity }),
        ...(price !== undefined && { price: parseFloat(String(price)) }),
        ...(currency !== undefined && { currency }),
        ...(change !== undefined && { change: parseFloat(String(change)) }),
        ...(changePercent !== undefined && { changePercent: parseFloat(String(changePercent)) }),
        ...(unit !== undefined && { unit }),
        ...(source !== undefined && { source: source || null }),
        ...(high52w !== undefined && { high52w: high52w !== null ? parseFloat(String(high52w)) : null }),
        ...(low52w !== undefined && { low52w: low52w !== null ? parseFloat(String(low52w)) : null }),
        ...(isActive !== undefined && { isActive }),
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: { ticker } })
  } catch (e: any) {
    console.error('[PriceTickers API] PUT error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to update price ticker' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.priceTicker.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Price ticker not found' },
        { status: 404 }
      )
    }

    // Hard delete for price tickers (they're not tenant-scoped audit data)
    await db.priceTicker.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (e: any) {
    console.error('[PriceTickers API] DELETE error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to delete price ticker' },
      { status: 500 }
    )
  }
}
