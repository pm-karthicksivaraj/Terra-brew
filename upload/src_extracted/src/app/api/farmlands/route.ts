import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['totalLandHolding', 'altitude', 'latitude', 'longitude', 'noOfTrees', 'shadeTreeDensity', 'shadeTreeCover', 'fullTimeWorkers', 'partTimeWorkers', 'seasonalWorkers', 'familyWorkers', 'bufferZoneDistanceToWater', 'conventionalLands', 'fallowPastureLand', 'estYield']
const dateFields = ['lastChemicalAppDate', 'conversionDate', 'soilCollectionDate', 'soilLabTestDate', 'soilResultDate']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })
  const lands = await db.farmLand.findMany({
    where: { moduleId, isActive: true },
    include: { farmer: { select: { id: true, fullName: true, farmerCode: true } }, _count: { select: { cultivations: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(lands)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId || !data.farmerId || !data.farmName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    const cleaned = cleanPayload(data, numericFields, dateFields)
    const land = await db.farmLand.create({
      data: cleaned,
    })
    return NextResponse.json(land, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
