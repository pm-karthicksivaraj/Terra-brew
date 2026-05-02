import { NextRequest, NextResponse } from 'next/server'
import { createBlock, getBatchChain, verifyChain } from '@/lib/hash-chain'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchId, stage, data } = body
    if (!batchId || !stage) return NextResponse.json({ message: 'batchId and stage required' }, { status: 400 })
    const block = createBlock(batchId, stage, data)
    return NextResponse.json(block, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  const doVerify = searchParams.get('verify')
  if (!batchId) return NextResponse.json({ message: 'batchId required' }, { status: 400 })
  if (doVerify) {
    const result = verifyChain(batchId)
    return NextResponse.json(result)
  }
  const chain = getBatchChain(batchId)
  return NextResponse.json(chain)
}
