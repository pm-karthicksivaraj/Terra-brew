import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ─── Public routes (no auth required) ────────────────────────────
// These are EXACT paths — we don't use prefix matching for public
// routes because "/super-admin" is public but "/super-admin/dashboard" is not.
const PUBLIC_EXACT_PATHS = ['/', '/login', '/super-admin', '/verify']

// Public route prefixes — anything starting with these is public
const PUBLIC_PREFIXES = ['/verify/']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

// Tenant-protected route prefixes
const TENANT_PROTECTED_PREFIXES = [
  '/dashboard',
  '/farmers',
  '/farmlands',
  '/cultivations',
  '/nurseries',
  '/land-preparations',
  '/crop-monitorings',
  '/fertilizer-apps',
  '/pest-disease',
  '/harvest',
  '/procurement',
  '/processing',
  '/cert-assessments',
  '/coffee-inspections',
  '/smart-contracts',
  '/marketplace',
  '/users',
  '/blockchain',
  '/traceability',
  '/qr-verify',
  '/nfc-tags',
]

// Platform admin route prefix
const PLATFORM_ADMIN_PREFIX = '/super-admin/dashboard'

function isTenantProtected(pathname: string): boolean {
  return TENANT_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

function isPlatformAdminPath(pathname: string): boolean {
  return pathname === PLATFORM_ADMIN_PREFIX || pathname.startsWith(PLATFORM_ADMIN_PREFIX + '/')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth for public routes, API routes, static assets, NextAuth internals
  if (
    isPublicPath(pathname) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Get the JWT token from the session cookie
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // ─── No token → redirect to appropriate login ──────────────────
  if (!token) {
    if (isPlatformAdminPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/super-admin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (isTenantProtected(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    // Unknown path with no token — allow through (404 will handle it)
    return NextResponse.next()
  }

  // ─── Platform admin route checks ────────────────────────────────
  if (isPlatformAdminPath(pathname)) {
    if (!token.isPlatformAdmin) {
      // Non-platform admin trying to access super-admin routes
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ─── Tenant route checks ────────────────────────────────────────
  if (isTenantProtected(pathname)) {
    // If a platform admin (without tenant context) tries to access
    // tenant routes, redirect them to their own dashboard.
    if (token.isPlatformAdmin && !token.tenantId) {
      const url = request.nextUrl.clone()
      url.pathname = '/super-admin/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    '/dashboard/:path*',
    '/farmers/:path*',
    '/farmlands/:path*',
    '/cultivations/:path*',
    '/nurseries/:path*',
    '/land-preparations/:path*',
    '/crop-monitorings/:path*',
    '/fertilizer-apps/:path*',
    '/pest-disease/:path*',
    '/harvest/:path*',
    '/procurement/:path*',
    '/processing/:path*',
    '/cert-assessments/:path*',
    '/coffee-inspections/:path*',
    '/smart-contracts/:path*',
    '/marketplace/:path*',
    '/users/:path*',
    '/blockchain/:path*',
    '/qr-verify/:path*',
    '/traceability/:path*',
    '/nfc-tags/:path*',
    // Protect super-admin dashboard (but not the login page)
    '/super-admin/dashboard/:path*',
  ],
}
