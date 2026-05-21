import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Complete login after tenant selection.
 *
 * Body: { email, password, tenantId }
 * - Finds the user in the specified tenant
 * - Verifies password
 * - Generates JWT with full tenant context including entityType
 * - Sets session cookie
 */
export async function POST(req: NextRequest) {
  try {
    // Guard: NEXTAUTH_SECRET must be set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[Select Tenant API] NEXTAUTH_SECRET is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { email, password, tenantId } = body

    if (!email || !password || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and tenant selection are required' },
        { status: 400 }
      )
    }

    // 1. Find the tenant
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId, isActive: true },
    })
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Organization not found or inactive' },
        { status: 401 }
      )
    }

    // 2. Find the user in this specific tenant
    const user = await db.user.findUnique({
      where: { email_tenantId: { email, tenantId: tenant.id } },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account deactivated' },
        { status: 401 }
      )
    }

    // 3. Verify password
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 4. Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // 5. Create NextAuth JWT and set session cookie
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 24 * 60 * 60 // 24 hours

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
        entityType: tenant.entityType,
        currency: tenant.currency,
        currencySymbol: tenant.currencySymbol,
        language: tenant.language,
        isPlatformAdmin: false,
        iat: now,
        exp: now + maxAge,
      },
      secret: process.env.NEXTAUTH_SECRET || '',
    })

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      entityType: tenant.entityType,
      currency: tenant.currency,
      currencySymbol: tenant.currencySymbol,
      language: tenant.language,
    }

    const response = NextResponse.json({ success: true, user: userData })

    // Set the NextAuth session cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    // Also set the callback URL cookie for NextAuth compatibility
    const origin = req.headers.get('x-forwarded-host')
      ? `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('x-forwarded-host')}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    response.cookies.set('next-auth.callback-url', `${origin}/dashboard`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (e: any) {
    console.error('[Select Tenant API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
