import { NextRequest, NextResponse } from 'next/server'

// Mock product monitoring data
const MOCK_MONITORING = [
  {
    id: 'mon-001',
    monitoringId: 'MON-2024-001',
    type: 'production_progress',
    product: 'Robusta Green Beans G2',
    batchId: 'BATCH-DL-2024-089',
    orderRef: 'PO-2024-0456',
    factory: 'Dak Lak Processing Co.',
    factoryAddress: '123 Nguyen Tat Thanh, Buon Ma Thuot',
    country: 'Vietnam',
    date: '2024-11-20',
    status: 'completed',
    report: {
      qtyOrdered: 18000,
      qtyProduced: 18200,
      qtyPassed: 17850,
      qtyFailed: 350,
      packingStatus: 'conform',
      shippingMarkStatus: 'conform',
      labellingStatus: 'conform',
      findings: 'Production completed ahead of schedule. Quality within specifications.',
    },
    createdAt: '2024-11-18T10:00:00Z',
  },
  {
    id: 'mon-002',
    monitoringId: 'MON-2024-002',
    type: 'on_site_verification',
    product: 'Arabica Specialty SHB',
    batchId: 'BATCH-LD-2024-034',
    orderRef: 'PO-2024-0478',
    factory: 'Lam Dong Highland Mill',
    factoryAddress: '456 Tran Hung Dao, Bao Loc',
    country: 'Vietnam',
    date: '2024-11-22',
    status: 'in_progress',
    report: null,
    createdAt: '2024-11-20T08:00:00Z',
  },
  {
    id: 'mon-003',
    monitoringId: 'MON-2024-003',
    type: 'quality_check',
    product: 'Robusta Screen 16+',
    batchId: 'BATCH-GL-2024-112',
    orderRef: 'PO-2024-0501',
    factory: 'Gia Lai Coffee Export',
    factoryAddress: '789 Le Loi, Pleiku',
    country: 'Vietnam',
    date: '2024-11-25',
    status: 'scheduled',
    report: null,
    createdAt: '2024-11-22T14:00:00Z',
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let results = [...MOCK_MONITORING]
  if (status && status !== 'all') {
    results = results.filter(m => m.status === status)
  }

  return NextResponse.json({ success: true, data: { data: results, total: results.length } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newMonitoring = {
    id: `mon-${Date.now()}`,
    monitoringId: `MON-2024-${String(MOCK_MONITORING.length + 1).padStart(3, '0')}`,
    ...body,
    status: 'scheduled',
    report: null,
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json({ success: true, data: newMonitoring })
}
