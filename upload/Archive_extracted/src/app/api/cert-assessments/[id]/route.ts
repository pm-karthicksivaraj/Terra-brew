import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cleanPayload } from '@/lib/sanitize'

const prisma = new PrismaClient()
const numericFields = ['gpsAtAssessmentLat', 'gpsAtAssessmentLng', 'totalScorePercentage']
const dateFields = ['assessmentDate']

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.certAssessment.findUnique({
    where: { id: params.id },
    include: {
      farmer: { select: { id: true, fullName: true } },
      cultivation: { select: { id: true, farmPlotName: true, farmerId: true, farmLandId: true } },
    },
  })
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const cleaned = cleanPayload(body, numericFields, dateFields)
    const item = await prisma.certAssessment.update({
      where: { id: params.id },
      data: cleaned,
    })
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.certAssessment.update({
      where: { id: params.id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Delete failed' }, { status: 500 })
  }
}
