import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Custom login endpoint that validates credentials AND sets the NextAuth
 * session cookie directly. This eliminates the need for the client-side
 * signIn() call, which was failing with "Failed to fetch" due to NextAuth v4
 * CSRF token issues in Next.js 16 App Router.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, tenantSlug } = body

    if (!email || !password || !tenantSlug) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and tenant slug are required' },
        { status: 400 }
      )
    }

    // 1. Find the tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true },
    })
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found or inactive' },
        { status: 401 }
      )
    }

    // 2. Find the user
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
        currency: tenant.currency,
        currencySymbol: tenant.currencySymbol,
        language: tenant.language,
        isPlatformAdmin: false,
        iat: now,
        exp: now + maxAge,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    })

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      currency: tenant.currency,
      currencySymbol: tenant.currencySymbol,
      language: tenant.language,
    }

    const response = NextResponse.json({ success: true, user: userData })

    // Set the NextAuth session cookie — this is the same cookie that
    // next-auth sets when you call signIn(). The SessionProvider on the
    // client will pick it up automatically on the next render/refresh.
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    // Also set the callback URL cookie for NextAuth compatibility
    response.cookies.set('next-auth.callback-url', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (e: any) {
    console.error('[Login API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
