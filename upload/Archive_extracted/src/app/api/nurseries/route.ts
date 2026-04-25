import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['nurseryCapacity', 'germinationRate', 'shadingConditions', 'nurseryLossCount', 'survivalRate', 'nurseryGpsLat', 'nurseryGpsLng']
const dateFields = ['sowingDate', 'transplantDate']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const cultivationId = searchParams.get('cultivationId')

  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await db.nursery.findMany({
    where: { moduleId, ...(cultivationId ? { cultivationId } : {}) },
    include: {
      farmer: { select: { id: true, fullName: true, farmerCode: true } },
      farmLand: { select: { id: true, farmName: true } },
      cultivation: { select: { id: true, farmPlotName: true, cultivatedCrop: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId || !data.cultivationId || !data.farmerId || !data.farmLandId) {
      return NextResponse.json({ message: 'Missing required fields: moduleId, cultivationId, farmerId, farmLandId' }, { status: 400 })
    }
    const nurseryId = data.nurseryId || `NUR-${Date.now()}`
    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.nursery.create({
      data: {
        ...cleaned,
        nurseryId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
