import { NextRequest, NextResponse } from 'next/server'

// Mock RFQ data
const MOCK_RFQS = [
  {
    id: 'rfq-001',
    rfqId: 'RFQ-2024-001',
    title: 'Robusta Green Beans G2',
    commodity: 'Robusta',
    variety: 'Green Beans',
    grade: 'Grade 2',
    quantity: 18000,
    targetPrice: 4.25,
    currency: 'EUR',
    status: 'published',
    publishedDate: '2024-11-15',
    responsesCount: 5,
    deliveryLocation: 'Ho Chi Minh City',
    deliveryDateRange: '2025-01-15 ~ 2025-02-28',
    incoterms: 'FOB',
    originCountry: 'Vietnam',
    destinationCountry: 'Germany',
    certifications: ['UTZ', 'Rainforest Alliance'],
    processingMethod: 'Wet Processed',
    minCupScore: 78,
    notes: 'Priority shipment for Q1 roasting schedule',
    createdAt: '2024-11-14T10:00:00Z',
  },
  {
    id: 'rfq-002',
    rfqId: 'RFQ-2024-002',
    title: 'Arabica Specialty SHB',
    commodity: 'Arabica',
    variety: 'SHB',
    grade: 'Specialty',
    quantity: 5000,
    targetPrice: 8.75,
    currency: 'USD',
    status: 'responded',
    publishedDate: '2024-11-10',
    responsesCount: 3,
    deliveryLocation: 'Da Nang Port',
    deliveryDateRange: '2025-02-01 ~ 2025-03-15',
    incoterms: 'CIF',
    originCountry: 'Vietnam',
    destinationCountry: 'USA',
    certifications: ['Organic', 'Fairtrade'],
    processingMethod: 'Natural/Dry Processed',
    minCupScore: 84,
    notes: 'Micro-lot, single origin requirement',
    createdAt: '2024-11-09T08:00:00Z',
  },
  {
    id: 'rfq-003',
    rfqId: 'RFQ-2024-003',
    title: 'Robusta Screen 16+',
    commodity: 'Robusta',
    variety: 'Screen 16+',
    grade: 'Grade 1',
    quantity: 24000,
    targetPrice: 3.95,
    currency: 'EUR',
    status: 'awarded',
    publishedDate: '2024-10-20',
    responsesCount: 7,
    deliveryLocation: 'Cat Lai Port, HCMC',
    deliveryDateRange: '2024-12-01 ~ 2025-01-31',
    incoterms: 'FOB',
    originCountry: 'Vietnam',
    destinationCountry: 'Italy',
    certifications: ['4C', 'UTZ'],
    processingMethod: 'Wet Processed',
    minCupScore: 75,
    notes: 'Annual contract for espresso blend supply',
    createdAt: '2024-10-19T12:00:00Z',
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let results = [...MOCK_RFQS]

  if (status && status !== 'all') {
    results = results.filter(r => r.status === status)
  }
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.rfqId.toLowerCase().includes(q) ||
      r.commodity.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({ success: true, data: { data: results, total: results.length } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newRfq = {
    id: `rfq-${Date.now()}`,
    rfqId: `RFQ-2024-${String(MOCK_RFQS.length + 1).padStart(3, '0')}`,
    ...body,
    status: 'draft',
    responsesCount: 0,
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json({ success: true, data: newRfq })
}
