import { NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // DueDiligenceStatement and Notification models are not yet implemented in the schema
  return NextResponse.json(
    { success: false, error: 'Not Implemented: DueDiligenceStatement model does not exist' },
    { status: 501 }
  )
}

// Also support POST for manual triggering
export async function POST(req: Request) {
  return GET(req)
}
