import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Mobile app token refresh endpoint.
 *
 * Accepts a refresh token (long-lived JWT) and returns
 * a new access token + refresh token pair.
 *
 * Flow:
 *   1. App sends { refreshToken }
 *   2. Decode the refresh token using next-auth/jwt decode
 *   3. Verify the user still exists and is active
 *   4. Issue new access token (24h) + refresh token (7d)
 *   5. Return { accessToken, refreshToken, user }
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[Mobile Auth Refresh] NEXTAUTH_SECRET is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Decode the refresh token (ignore expiration for grace period)
    const { decode } = await import('next-auth/jwt')
    const decoded = await decode({
      token: refreshToken,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if this is a refresh-type token
    if (decoded.tokenType !== 'refresh') {
      return NextResponse.json(
        { success: false, error: 'Invalid token type' },
        { status: 401 }
      )
    }

    const isPlatformAdmin = decoded.isPlatformAdmin === true

    if (isPlatformAdmin) {
      // Platform admin refresh
      const admin = await db.platformUser.findUnique({
        where: { id: decoded.id as string },
      })

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account deactivated' },
          { status: 401 }
        )
      }

      const { encode } = await import('next-auth/jwt')
      const now = Math.floor(Date.now() / 1000)

      const newAccessToken = await encode({
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

      const newRefreshToken = await encode({
        token: {
          id: admin.id,
          email: admin.email,
          isPlatformAdmin: true,
          tokenType: 'refresh',
          iat: now,
          exp: now + 7 * 24 * 60 * 60,
        },
        secret: process.env.NEXTAUTH_SECRET,
      })

      return NextResponse.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isPlatformAdmin: true,
        },
      })
    } else {
      // Tenant user refresh
      const user = await db.user.findUnique({
        where: { id: decoded.id as string },
        include: { tenant: true },
      })

      if (!user || !user.isActive || !user.tenant?.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account or tenant deactivated' },
          { status: 401 }
        )
      }

      const tenant = user.tenant

      const { encode } = await import('next-auth/jwt')
      const now = Math.floor(Date.now() / 1000)

      const newAccessToken = await encode({
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
          exp: now + 24 * 60 * 60,
        },
        secret: process.env.NEXTAUTH_SECRET,
      })

      const newRefreshToken = await encode({
        token: {
          id: user.id,
          email: user.email,
          tenantId: tenant.id,
          isPlatformAdmin: false,
          tokenType: 'refresh',
          iat: now,
          exp: now + 7 * 24 * 60 * 60,
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
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData,
      })
    }
  } catch (e: any) {
    console.error('[Mobile Auth Refresh] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Invalid or expired refresh token' },
      { status: 401 }
    )
  }
}
