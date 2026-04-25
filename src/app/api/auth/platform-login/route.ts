import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Custom platform admin login endpoint.
 * Validates platform admin credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await db.platformUser.findUnique({
      where: { email },
    })
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account deactivated' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, admin.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await db.platformUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isPlatformAdmin: true,
      },
    })
  } catch (e: any) {
    console.error('[Platform Login API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
