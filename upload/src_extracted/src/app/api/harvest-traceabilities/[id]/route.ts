import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['cherryRipeness', 'harvestLabourCost', 'sampleWeight', 'sampleArea', 'sampleYield', 'estimatedYieldPerHa', 'targetMoisture', 'moistureContent', 'defectiveBeans', 'foreignMatter', 'cupScore', 'dryingDurationDays']
const dateFields = ['plannedHarvestDate', 'actualHarvestDate', 'batchTimestamp']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.harvestTraceability.findUnique({
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

    // Auto-calculate yield on update
    const sampleWeight = data.sampleWeight || 0
    const sampleArea = data.sampleArea || 0
    const sampleYield = data.sampleYield ?? (sampleWeight && sampleArea ? (sampleWeight / sampleArea) * 10000 : undefined)
    const estimatedYieldPerHa = data.estimatedYieldPerHa ?? sampleYield

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.harvestTraceability.update({
      where: { id },
      data: {
        ...cleaned,
        sampleYield,
        estimatedYieldPerHa,
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
    await db.harvestTraceability.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
