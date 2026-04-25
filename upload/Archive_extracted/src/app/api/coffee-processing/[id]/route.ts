import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = [
  'cherryRipeness', 'harvestLabourCost', 'sampleWeight', 'sampleArea',
  'sampleYield', 'estimatedYieldPerHa', 'moistureContent', 'defectiveBeans',
  'foreignMatter', 'cupScore', 'dryingDurationDays', 'targetMoisture',
]
const dateFields = ['plannedHarvestDate', 'actualHarvestDate', 'batchTimestamp']

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.harvestTraceability.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, fullName: true } },
        cultivation: { select: { id: true, farmPlotName: true, cultivatedCrop: true, cropVariety: true } },
        farmLand: { select: { id: true, farmName: true } },
      },
    })
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const clean = cleanPayload(body, numericFields, dateFields)
    const { processingStage, actualHarvestDate, batchNotes } = clean

    const updateData: any = {}
    if (processingStage !== undefined) updateData.processingStage = processingStage
    if (actualHarvestDate) updateData.actualHarvestDate = new Date(actualHarvestDate)
    if (batchNotes !== undefined) updateData.batchNotes = batchNotes

    const updated = await db.harvestTraceability.update({
      where: { id },
      data: updateData,
    })

    // Create hash chain block for the processing stage change
    if (processingStage && updated.batchId) {
      try {
        const { createBlock } = await import('@/lib/hash-chain')
        await createBlock(updated.batchId, processingStage, updated)
      } catch { /* hash chain is optional */ }
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await db.harvestTraceability.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Deleted successfully', id: deleted.id })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
