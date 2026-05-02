import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })
  const items = await db.lot.findMany({
    where: { harvest: { cultivation: { moduleId } } },
    include: {
      harvest: {
        include: {
          cultivation: {
            select: { farmPlotName: true, cultivatedCrop: true, farmer: { select: { fullName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.harvestId) {
      return NextResponse.json({ message: 'harvestId required' }, { status: 400 })
    }
    const lotCode = `LOT-${Date.now().toString(36).toUpperCase()}`
    const item = await db.lot.create({
      data: {
        ...data,
        lotCode,
        processingDate: data.processingDate ? new Date(data.processingDate) : undefined,
        exportDate: data.exportDate ? new Date(data.exportDate) : undefined,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
