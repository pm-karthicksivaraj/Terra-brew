/**
 * Mobile JWT Authentication API
 *
 * POST: Accepts { email, password, tenantSlug }, validates credentials,
 * returns a signed JWT for mobile app consumption.
 */
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'
import { tenantLoginSchema } from '@/lib/validators'
import { apiResponse, apiError, validateBody } from '@/lib/api-middleware'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'
const JWT_EXPIRY = '24h'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = validateBody(tenantLoginSchema, body)
    if ('error' in validation) return validation.error

    const { email, password, tenantSlug } = validation.data

    // Look up tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true },
    })
    if (!tenant) {
      return apiError('Tenant not found or inactive', 404)
    }

    // Look up user within tenant
    const user = await db.user.findUnique({
      where: { email_tenantId: { email, tenantId: tenant.id } },
    })
    if (!user) {
      return apiError('Invalid credentials', 401)
    }
    if (!user.isActive) {
      return apiError('Account deactivated', 403)
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return apiError('Invalid credentials', 401)
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Build JWT payload
    const tokenPayload = {
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

    // Sign JWT
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    })

    return apiResponse({
      token,
      user: tokenPayload,
    }, 200)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}
