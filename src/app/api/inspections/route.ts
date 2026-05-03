import { NextRequest, NextResponse } from 'next/server'

// Mock inspection data
const MOCK_INSPECTIONS = [
  {
    id: 'ins-001',
    requestId: 'INS-2024-001',
    type: 'pre_shipment',
    inspectionLevel: 'G-I',
    commodity: 'Robusta Green Beans',
    quantity: 18000,
    supplier: 'Dak Lak Province Co-op',
    inspector: 'Nguyen Van Minh',
    date: '2024-11-20',
    status: 'completed',
    passFail: 'pass',
    country: 'Vietnam',
    location: 'Cat Lai Port, HCMC',
    createdAt: '2024-11-18T10:00:00Z',
  },
  {
    id: 'ins-002',
    requestId: 'INS-2024-002',
    type: 'during_production',
    inspectionLevel: 'G-II',
    commodity: 'Arabica Specialty SHB',
    quantity: 5000,
    supplier: 'Lam Dong Highland Farm',
    inspector: 'Tran Thi Lan',
    date: '2024-11-22',
    status: 'in_progress',
    passFail: null,
    country: 'Vietnam',
    location: 'Bao Loc Processing Plant',
    createdAt: '2024-11-20T08:00:00Z',
  },
  {
    id: 'ins-003',
    requestId: 'INS-2024-003',
    type: 'final',
    inspectionLevel: 'S-3',
    commodity: 'Robusta Screen 16+',
    quantity: 24000,
    supplier: 'Gia Lai Coffee Export',
    inspector: 'Le Hoang Anh',
    date: '2024-11-25',
    status: 'scheduled',
    passFail: null,
    country: 'Vietnam',
    location: 'Pleiku Warehouse',
    createdAt: '2024-11-22T14:00:00Z',
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let results = [...MOCK_INSPECTIONS]
  if (status && status !== 'all') {
    results = results.filter(i => i.status === status)
  }

  return NextResponse.json({ success: true, data: { data: results, total: results.length } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newInspection = {
    id: `ins-${Date.now()}`,
    requestId: `INS-2024-${String(MOCK_INSPECTIONS.length + 1).padStart(3, '0')}`,
    ...body,
    status: 'requested',
    passFail: null,
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json({ success: true, data: newInspection })
}
