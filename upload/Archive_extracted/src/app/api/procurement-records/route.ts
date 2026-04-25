import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cleanPayload } from '@/lib/sanitize'

const prisma = new PrismaClient()
const numericFields = ['grossWeight', 'tareWeight', 'netWeight', 'moistureContentAtGate', 'moistureDeduction', 'adjustedNetWeight', 'defects', 'purchasePricePerKg', 'totalPurchaseAmount', 'certPremiumApplied']
const dateFields = ['procurementDate', 'paymentDate']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  const farmerId = searchParams.get('farmerId')
  const collectionCentreId = searchParams.get('collectionCentreId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const where: any = { moduleId, isActive: true }
  if (farmerId) where.farmerId = farmerId
  if (collectionCentreId) where.collectionCentreId = collectionCentreId

  const items = await prisma.procurementRecord.findMany({
    where,
    include: {
      collectionCentre: { select: { id: true, centreName: true } },
      farmer: { select: { id: true, fullName: true } },
      farmLand: { select: { id: true, farmName: true } },
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
    const item = await prisma.procurementRecord.create({
      data: {
        ...cleaned,
        procurementId: `PR-${Date.now()}`,
        procurementDate: cleaned.procurementDate || new Date(),
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Create failed' }, { status: 500 })
  }
}
