import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cleanPayload } from '@/lib/sanitize'

const prisma = new PrismaClient()
const numericFields = ['storageCapacityKg', 'centreGpsLat', 'centreGpsLng']
const dateFields = ['scaleLastCalibrationDate']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await prisma.collectionCentre.findMany({
    where: { moduleId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    const cleaned = cleanPayload(body, numericFields, dateFields)
    const item = await prisma.collectionCentre.create({
      data: {
        ...cleaned,
        centreId: `CC-${Date.now()}`,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Create failed' }, { status: 500 })
  }
}
