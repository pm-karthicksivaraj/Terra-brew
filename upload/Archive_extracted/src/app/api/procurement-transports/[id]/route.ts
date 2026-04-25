import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['transportCost', 'temperatureDuringTransport', 'receivedAtPlantKg', 'weightVariance']
const dateFields = ['departureDateTime', 'arrivalDateTime']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.procurementTransport.findUnique({
    where: { id },
    include: {
      procurementRecord: { select: { id: true, procurementId: true, batchId: true } },
    },
  })
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await _req.json()
    const cleaned = cleanPayload(body, numericFields, dateFields)
    const item = await db.procurementTransport.update({
      where: { id },
      data: cleaned,
    })
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.procurementTransport.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Delete failed' }, { status: 500 })
  }
}
