import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['totalLandHolding', 'altitude', 'latitude', 'longitude', 'noOfTrees', 'shadeTreeDensity', 'shadeTreeCover', 'fullTimeWorkers', 'partTimeWorkers', 'seasonalWorkers', 'familyWorkers', 'bufferZoneDistanceToWater', 'conventionalLands', 'fallowPastureLand', 'estYield']
const dateFields = ['lastChemicalAppDate', 'conversionDate', 'soilCollectionDate', 'soilLabTestDate', 'soilResultDate']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const land = await db.farmLand.findUnique({
    where: { id },
    include: {
      farmer: { select: { id: true, fullName: true, farmerCode: true } },
      cultivations: true,
      soilAnalysis: true,
    },
  })
  if (!land) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(land)
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await _req.json()
    const cleaned = cleanPayload(data, numericFields, dateFields)
    const land = await db.farmLand.update({
      where: { id },
      data: {
        ...cleaned,
        id: undefined, moduleId: undefined, createdAt: undefined, updatedAt: undefined,
      },
    })
    return NextResponse.json(land)
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.farmLand.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
