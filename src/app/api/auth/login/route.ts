import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Email-first tenant discovery login endpoint.
 *
 * Flow:
 *   1. User submits { email, password } (no tenantSlug)
 *   2. System finds all active users with this email across all tenants
 *   3. Verifies password against the first match
 *   4. If 1 tenant → auto-login, set session cookie, return user
 *   5. If multiple tenants → return { requiresTenantSelection: true, tenants: [...] }
 *   6. If 0 found → return invalid credentials error
 */
export async function POST(req: NextRequest) {
  try {
    // Guard: NEXTAUTH_SECRET must be set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[Login API] NEXTAUTH_SECRET is not set')
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

    // 1. Find all users with this email across all active tenants
    const users = await db.user.findMany({
      where: {
        email,
        isActive: true,
        tenant: { isActive: true },
      },
      include: {
        tenant: true,
      },
    })

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 2. Verify password against all matches (same email, but passwords could differ per tenant)
    type UserWithTenant = Awaited<ReturnType<typeof db.user.findMany<{ include: { tenant: true } }>>>[number]
    const validUsers: UserWithTenant[] = []
    for (const user of users) {
      const valid = await verifyPassword(password, user.passwordHash)
      if (valid) {
        validUsers.push(user)
      }
    }

    if (validUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 3a. If only one valid match → auto-login
    if (validUsers.length === 1) {
      const user = validUsers[0]
      const tenant = user.tenant

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      // Create NextAuth JWT and set session cookie
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
    }

    // 3b. Multiple tenants → return tenant list for selection
    const tenants = validUsers.map((user) => ({
      tenantId: user.tenant.id,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
      entityType: user.tenant.entityType,
      countryCode: user.tenant.countryCode,
      country: user.tenant.country,
      currency: user.tenant.currency,
      language: user.tenant.language,
      userId: user.id,
      userName: user.name,
      role: user.role,
    }))

    return NextResponse.json({
      success: true,
      requiresTenantSelection: true,
      tenants,
    })
  } catch (e: any) {
    console.error('[Login API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
