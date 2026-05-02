import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['phiDays', 'reiHours', 'laborCost', 'totalCost']
const dateFields = ['scoutingDate', 'treatmentDate']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.pestDiseaseManagement.findUnique({
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

    // Auto-calculate totalCost on update
    const laborCost = data.laborCost || 0
    const dose = parseFloat(data.dose) || 0
    const totalCost = data.totalCost ?? (laborCost + dose || undefined)

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.pestDiseaseManagement.update({
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
    await db.pestDiseaseManagement.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
