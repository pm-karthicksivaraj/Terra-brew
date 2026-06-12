import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Mobile app platform admin login endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

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

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
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

    // Create access token (24h) and refresh token (7d)
    const { encode } = await import('next-auth/jwt')
    const now = Math.floor(Date.now() / 1000)

    const token = await encode({
      token: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isPlatformAdmin: true,
        iat: now,
        exp: now + 24 * 60 * 60,
      },
      secret: process.env.NEXTAUTH_SECRET,
    })

    const refreshToken = await encode({
      token: {
        id: admin.id,
        email: admin.email,
        isPlatformAdmin: true,
        tokenType: 'refresh',
        iat: now,
        exp: now + 7 * 24 * 60 * 60, // 7 days
      },
      secret: process.env.NEXTAUTH_SECRET,
    })

    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isPlatformAdmin: true,
      },
    })
  } catch (e: any) {
    console.error('[Mobile Auth Platform] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
