import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanPayload } from '@/lib/sanitize'

const numericFields = ['availableQty', 'pricePerKg', 'cupScore']
const dateFields = ['listingDate', 'priceValidUntil']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')

  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await db.marketplaceListing.findMany({
    where: { moduleId },
    include: {
      transactions: { orderBy: { createdAt: 'desc' } },
      module: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId) {
      return NextResponse.json({ message: 'Missing required field: moduleId' }, { status: 400 })
    }

    // Auto-generate listingId
    const listingId = data.listingId || `ML-${Date.now()}`

    const cleaned = cleanPayload(data, numericFields, dateFields)
    const item = await db.marketplaceListing.create({
      data: {
        ...cleaned,
        listingId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
