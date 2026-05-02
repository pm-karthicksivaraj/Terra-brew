import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['organicMatter', 'costPerUnit', 'totalCost', 'labourCost']
const dateFields = ['soilTestDate', 'applicationDate']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.fertilizerApplication.findUnique({
    where: { id },
    include: {
      farmer: true,
      farmLand: true,
      cultivation: true,
      module: { select: { id: true, name: true } },
    },
  })
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await _req.json()

    // Auto-calculate totalCost on update if relevant fields changed
    const dosePerHa = parseFloat(data.dosePerHa) || 0
    const appliedQty = parseFloat(data.appliedQty) || 0
    const costPerUnit = data.costPerUnit || 0
    const totalCost = data.totalCost ?? (dosePerHa * appliedQty * costPerUnit || undefined)

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.fertilizerApplication.update({
      where: { id },
      data: {
        ...cleaned,
        totalCost,
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
    await db.fertilizerApplication.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
