import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['cherryRipeness', 'harvestLabourCost', 'sampleWeight', 'sampleArea', 'sampleYield', 'estimatedYieldPerHa', 'moistureContent', 'defectiveBeans', 'foreignMatter', 'cupScore', 'dryingDurationDays']
const dateFields = ['plannedHarvestDate', 'actualHarvestDate', 'batchTimestamp']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const cultivationId = searchParams.get('cultivationId')

  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await db.harvestTraceability.findMany({
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

    // Auto-generate batchId
    const batchId = data.batchId || `BATCH-${Date.now()}`

    // Auto-calculate yield: sampleYield = sampleWeight / sampleArea * 10000
    const sampleWeight = data.sampleWeight || 0
    const sampleArea = data.sampleArea || 0
    const sampleYield = data.sampleYield ?? (sampleWeight && sampleArea ? (sampleWeight / sampleArea) * 10000 : undefined)
    const estimatedYieldPerHa = data.estimatedYieldPerHa ?? sampleYield

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.harvestTraceability.create({
      data: {
        ...cleaned,
        batchId,
        sampleYield,
        estimatedYieldPerHa,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
