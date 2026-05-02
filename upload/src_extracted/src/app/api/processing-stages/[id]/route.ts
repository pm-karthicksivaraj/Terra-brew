import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripEmpty } from '@/lib/sanitize'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const record = await db.processingStageRecord.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 })
    }
    return NextResponse.json({
      ...record,
      stageData: record.stageData ? JSON.parse(record.stageData) : {},
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { batchId, stageType, stageData, notes, recordedBy } = body

    const data: any = {}
    if (batchId !== undefined) data.batchId = batchId
    if (stageType !== undefined) data.stageType = stageType
    if (stageData !== undefined) data.stageData = typeof stageData === 'string' ? stageData : JSON.stringify(stageData)
    if (notes !== undefined) data.notes = notes
    if (recordedBy !== undefined) data.recordedBy = recordedBy

    const sanitized = stripEmpty(data)
    const record = await db.processingStageRecord.update({
      where: { id },
      data: sanitized,
    })

    return NextResponse.json({
      ...record,
      stageData: record.stageData ? JSON.parse(record.stageData) : {},
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const record = await db.processingStageRecord.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Record soft-deleted', id: record.id })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
