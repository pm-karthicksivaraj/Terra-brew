import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Custom platform admin login endpoint.
 * Validates platform admin credentials AND sets the NextAuth session cookie directly.
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

    // Create NextAuth JWT and set session cookie
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 24 * 60 * 60

    const token = await encode({
      token: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isPlatformAdmin: true,
        iat: now,
        exp: now + maxAge,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    })

    const userData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isPlatformAdmin: true,
    }

    const response = NextResponse.json({ success: true, user: userData })

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('next-auth.callback-url', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/super-admin/dashboard`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (e: any) {
    console.error('[Platform Login API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
