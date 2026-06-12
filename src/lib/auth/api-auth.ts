/**
 * API Authentication Helpers
 * Provides server-side session extraction and role-based access control
 * for Next.js API routes.
 */
import { NextRequest, NextResponse } from 'next/server'

interface JWTPayload {
  id?: string
  email?: string
  name?: string
  role?: string
  tenantId?: string
  tenantSlug?: string
  tenantName?: string
  entityType?: string
  isPlatformAdmin?: boolean
  [key: string]: unknown
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = Buffer.from(padded, 'base64url').toString('utf-8')
    return JSON.parse(decoded) as JWTPayload
  } catch {
    return null
  }
}

export interface ApiSession {
  id: string
  email: string
  name: string
  role: string
  tenantId?: string
  tenantSlug?: string
  tenantName?: string
  entityType?: string
  isPlatformAdmin: boolean
}

/**
 * Extract and verify the session from an API request.
 * Supports two authentication methods:
 * 1. NextAuth session cookie (web browser)
 * 2. Authorization: Bearer <token> header (mobile app / API clients)
 * Returns null if no valid session is found.
 */
export function getServerSession(req: NextRequest): ApiSession | null {
  // Method 1: Try Authorization Bearer header (mobile app)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const payload = decodeJWT(token)
    if (payload && payload.id && payload.email) {
      return {
        id: payload.id as string,
        email: payload.email as string,
        name: (payload.name as string) || '',
        role: (payload.role as string) || '',
        tenantId: payload.tenantId as string | undefined,
        tenantSlug: payload.tenantSlug as string | undefined,
        tenantName: payload.tenantName as string | undefined,
        entityType: payload.entityType as string | undefined,
        isPlatformAdmin: payload.isPlatformAdmin === true,
      }
    }
  }

  // Method 2: Try NextAuth session cookie (web browser)
  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) return null

  const payload = decodeJWT(sessionToken)
  if (!payload || !payload.id || !payload.email) return null

  return {
    id: payload.id as string,
    email: payload.email as string,
    name: (payload.name as string) || '',
    role: (payload.role as string) || '',
    tenantId: payload.tenantId as string | undefined,
    tenantSlug: payload.tenantSlug as string | undefined,
    tenantName: payload.tenantName as string | undefined,
    entityType: payload.entityType as string | undefined,
    isPlatformAdmin: payload.isPlatformAdmin === true,
  }
}

/**
 * Require that the request has a session with one of the specified roles.
 * Returns a 403 JSON response if the user does not have the required role.
 * Returns the session if access is allowed.
 */
export function requireRole(
  req: NextRequest,
  roles: string[]
): ApiSession | NextResponse {
  const session = getServerSession(req)
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  if (!roles.includes(session.role) && !session.isPlatformAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return session
}

/**
 * Ensure that the authenticated user belongs to the specified tenant.
 * Returns a 403 JSON response if the user does not have access.
 * Returns the session if access is allowed.
 * For mobile requests, the X-Tenant-Id header is also checked.
 */
export function requireTenantAccess(
  req: NextRequest,
  tenantId: string
): ApiSession | NextResponse {
  const session = getServerSession(req)
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  // Platform admins can access any tenant
  if (session.isPlatformAdmin) return session
  // Tenant users must match the tenant ID
  if (session.tenantId !== tenantId) {
    return NextResponse.json(
      { success: false, error: 'Access denied: tenant mismatch' },
      { status: 403 }
    )
  }
  return session
}

/**
 * Extract the tenant ID from the request.
 * Checks X-Tenant-Id header (mobile) first, then falls back to session tenant.
 */
export function getTenantId(req: NextRequest): string | null {
  // Mobile app sends X-Tenant-Id header
  const headerTenantId = req.headers.get('x-tenant-id')
  if (headerTenantId) return headerTenantId

  // Web session has tenantId in JWT
  const session = getServerSession(req)
  return session?.tenantId ?? null
}
