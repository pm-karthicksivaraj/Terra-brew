import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Custom login endpoint that works around NextAuth v4 + App Router CSRF issues.
 * Validates credentials first, then the client-side code uses next-auth signIn
 * to establish the session (which works because the browser handles cookies/CSRF automatically).
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

    // 5. Return user data for the client to establish session
    return NextResponse.json({
      success: true,
      user: {
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
      },
    })
  } catch (e: any) {
    console.error('[Login API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
