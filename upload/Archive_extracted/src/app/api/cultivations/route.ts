import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['cultivationArea', 'plantingSpacing', 'treeDensity', 'seedQuantity', 'seedPrice', 'seedCost', 'sowingCharges', 'sowingCost', 'shadeCover', 'latitude', 'longitude']
const dateFields = ['sowingDate']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })
  const items = await db.cultivation.findMany({
    where: { moduleId, isActive: true },
    include: {
      farmer: { select: { id: true, fullName: true, farmerCode: true } },
      farmLand: { select: { id: true, farmName: true } },
      _count: { select: { harvests: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId || !data.farmerId || !data.farmLandId || !data.farmPlotName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.cultivation.create({
      data: cleaned,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
