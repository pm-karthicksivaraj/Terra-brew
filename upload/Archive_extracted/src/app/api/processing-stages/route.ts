import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId') || ''
    const stageType = searchParams.get('stageType') || ''
    const batchId = searchParams.get('batchId') || ''

    const where: any = { isActive: true }
    if (moduleId) where.moduleId = moduleId
    if (stageType) where.stageType = stageType
    if (batchId) where.batchId = batchId

    const records = await db.processingStageRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Parse stageData JSON for each record
    const parsed = records.map(r => ({
      ...r,
      stageData: r.stageData ? JSON.parse(r.stageData) : {},
    }))

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { moduleId, batchId, stageType, stageData, notes, recordedBy } = body

    if (!moduleId || !batchId || !stageType) {
      return NextResponse.json({ message: 'moduleId, batchId, and stageType are required' }, { status: 400 })
    }

    const record = await db.processingStageRecord.create({
      data: {
        moduleId,
        batchId,
        stageType,
        stageData: typeof stageData === 'string' ? stageData : JSON.stringify(stageData || {}),
        notes: notes || null,
        recordedBy: recordedBy || null,
      },
    })

    return NextResponse.json({
      ...record,
      stageData: record.stageData ? JSON.parse(record.stageData) : {},
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
