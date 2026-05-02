import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = [
  'cherryRipeness', 'harvestLabourCost', 'sampleWeight', 'sampleArea',
  'sampleYield', 'estimatedYieldPerHa', 'moistureContent', 'defectiveBeans',
  'foreignMatter', 'cupScore', 'dryingDurationDays', 'targetMoisture',
]
const dateFields = ['plannedHarvestDate', 'actualHarvestDate', 'batchTimestamp']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })
  const items = await db.harvestTraceability.findMany({
    where: { moduleId, isActive: true },
    include: {
      farmer: { select: { id: true, fullName: true } },
      cultivation: { select: { id: true, farmPlotName: true, cultivatedCrop: true, cropVariety: true } },
      farmLand: { select: { id: true, farmName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 })

    const clean = cleanPayload(body, numericFields, dateFields)
    // Extract known fields, don't spread raw rest
    const { processingStage, actualHarvestDate, batchNotes, ...safeFields } = clean

    const updated = await db.harvestTraceability.update({
      where: { id },
      data: {
        ...(processingStage !== undefined && { processingStage }),
        ...(actualHarvestDate && { actualHarvestDate: new Date(actualHarvestDate) }),
        ...(batchNotes !== undefined && { batchNotes }),
      },
    })

    // Create hash chain block for the processing stage change
    const { createBlock } = await import('@/lib/hash-chain')
    createBlock(updated.batchId, processingStage || 'Processing', updated)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
