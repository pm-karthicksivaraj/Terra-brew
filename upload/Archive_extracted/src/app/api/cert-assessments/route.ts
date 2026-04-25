import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cleanPayload } from '@/lib/sanitize'

const prisma = new PrismaClient()
const numericFields = ['gpsAtAssessmentLat', 'gpsAtAssessmentLng', 'totalScorePercentage']
const dateFields = ['assessmentDate']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  const farmerId = searchParams.get('farmerId')
  const certificationStandard = searchParams.get('certificationStandard')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const where: any = { moduleId, isActive: true }
  if (farmerId) where.farmerId = farmerId
  if (certificationStandard) where.certificationStandard = certificationStandard

  const items = await prisma.certAssessment.findMany({
    where,
    include: {
      farmer: { select: { id: true, fullName: true } },
      cultivation: { select: { id: true, farmPlotName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    const cleaned = cleanPayload(body, numericFields, dateFields)
    const item = await prisma.certAssessment.create({
      data: {
        ...cleaned,
        assessmentId: `CA-${Date.now()}`,
        assessmentDate: cleaned.assessmentDate || new Date(),
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Create failed' }, { status: 500 })
  }
}
