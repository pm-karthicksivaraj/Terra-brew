import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

/**
 * Mobile app tenant selection endpoint.
 * When a user belongs to multiple tenants, the app sends
 * { email, password, tenantId } to select a specific tenant.
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
    const { email, password, tenantId } = body

    if (!email || !password || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and tenantId are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email_tenantId: { email, tenantId } },
      include: { tenant: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const tenant = user.tenant

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Create JWT token
    const { encode } = await import('next-auth/jwt')
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 24 * 60 * 60

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
      secret: process.env.NEXTAUTH_SECRET,
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

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    })
  } catch (e: any) {
    console.error('[Mobile Auth Select Tenant] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
