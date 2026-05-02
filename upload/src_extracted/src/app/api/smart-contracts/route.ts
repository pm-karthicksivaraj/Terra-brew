import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['quantity', 'pricePerKg']
const dateFields = ['contractDate']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const cultivationId = searchParams.get('cultivationId')

  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await db.smartContract.findMany({
    where: { moduleId, ...(cultivationId ? { cultivationId } : {}) },
    include: {
      cultivation: { select: { id: true, farmPlotName: true, cultivatedCrop: true, farmer: { select: { id: true, fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId) {
      return NextResponse.json({ message: 'Missing required field: moduleId' }, { status: 400 })
    }

    // Auto-generate contractId
    const contractId = data.contractId || `SC-${Date.now()}`

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.smartContract.create({
      data: {
        ...cleaned,
        contractId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
