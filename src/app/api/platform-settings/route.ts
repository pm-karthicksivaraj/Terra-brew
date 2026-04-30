import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/platform-settings — returns all platform settings grouped by category
 * Query params: ?category=business (optional filter)
 */
export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category')
    const where = category ? { category, isActive: true } : { isActive: true }

    const settings = await db.platformSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    })

    // Group by category
    const grouped: Record<string, Record<string, { value: string; valueType: string; description?: string | null; isPublic: boolean }>> = {}
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = {}
      grouped[s.category][s.key] = {
        value: s.value,
        valueType: s.valueType,
        description: s.description,
        isPublic: s.isPublic,
      }
    }

    return NextResponse.json({ success: true, data: grouped })
  } catch (e: any) {
    console.error('[Platform Settings GET] Error:', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/platform-settings — create a new setting
 * Body: { category, key, value, valueType?, description?, isPublic? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, key, value, valueType = 'string', description, isPublic = false } = body

    if (!category || !key || value === undefined) {
      return NextResponse.json({ success: false, error: 'category, key, and value are required' }, { status: 400 })
    }

    const setting = await db.platformSetting.upsert({
      where: { category_key: { category, key } },
      update: { value, valueType, description, isPublic },
      create: { category, key, value, valueType, description, isPublic },
    })

    return NextResponse.json({ success: true, data: setting })
  } catch (e: any) {
    console.error('[Platform Settings POST] Error:', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

/**
 * PUT /api/platform-settings — update a setting
 * Body: { category, key, value, description?, isPublic? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, key, value, description, isPublic } = body

    if (!category || !key) {
      return NextResponse.json({ success: false, error: 'category and key are required' }, { status: 400 })
    }

    const existing = await db.platformSetting.findUnique({
      where: { category_key: { category, key } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 })
    }

    const updated = await db.platformSetting.update({
      where: { category_key: { category, key } },
      data: {
        ...(value !== undefined && { value }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    console.error('[Platform Settings PUT] Error:', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
