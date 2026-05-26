import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tenants = await db.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        currency: true,
        language: true,
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: tenants })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
