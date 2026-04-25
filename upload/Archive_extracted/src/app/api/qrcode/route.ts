import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')
  if (!data) return NextResponse.json({ message: 'data param required' }, { status: 400 })
  try {
    const qr = await QRCode.toDataURL(data, { width: 300, margin: 2 })
    return NextResponse.json({ qr })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
