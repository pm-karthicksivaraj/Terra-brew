import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['cultivationArea', 'plantingSpacing', 'treeDensity', 'seedQuantity', 'seedPrice', 'seedCost', 'sowingCharges', 'sowingCost', 'shadeCover', 'latitude', 'longitude']
const dateFields = ['sowingDate']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.cultivation.findUnique({
    where: { id },
    include: { farmer: true, farmLand: true, harvests: { include: { lots: true } } },
  })
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await _req.json()
    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.cultivation.update({
      where: { id },
      data: {
        ...cleaned,
        id: undefined, moduleId: undefined, createdAt: undefined, updatedAt: undefined,
      },
    })
    return NextResponse.json(item)
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.cultivation.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
