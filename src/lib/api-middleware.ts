/**
 * API Middleware utilities for multi-tenant request handling.
 * 
 * Middleware chain:
 * 1. Authenticate (verify JWT)
 * 2. Authorize (check role permissions)
 * 3. Tenant Context (inject tenantId into all queries)
 * 4. Validate (Zod schema validation)
 * 5. Rate Limit (Upstash Redis)
 */
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/config'
import { z, ZodSchema } from 'zod'
import jwt from 'jsonwebtoken'
import type { AuthenticatedUser, Action, ModuleSlug, PermissionMap, PlatformRole, TenantRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'

// ════════════════════════════════════════════════════════════════
// RBAC PERMISSION MATRIX
// ════════════════════════════════════════════════════════════════

const FULL_ACCESS: Action[] = ['create', 'read', 'update', 'delete', 'export', 'approve']
const READ_WRITE: Action[] = ['create', 'read', 'update', 'export']
const READ_ONLY: Action[] = ['read', 'export']
const READ_CREATE: Action[] = ['create', 'read', 'export']

const ALL_MODULES: ModuleSlug[] = [
  'farmers', 'farmlands', 'cultivations', 'nurseries', 'land-preparations',
  'crop-monitorings', 'fertilizer-apps', 'pest-disease-mgmts',
  'harvest-traceabilities', 'procurement', 'processing',
  'cert-assessments', 'coffee-inspections', 'smart-contracts', 'marketplace',
  'dashboard', 'reports', 'settings', 'users',
  'eudr-compliance', 'export-docs', 'shipments', 'buyers', 'trading-desk',
  'api-access', 'deforestation', 'iot-tracking', 'qc-verification',
  'compliance-marketplace', 'analytics', 'logistics', 'product-monitoring', 'traces',
]

const B2B_MODULES: ModuleSlug[] = [
  'eudr-compliance', 'export-docs', 'shipments', 'buyers', 'trading-desk',
  'api-access', 'deforestation', 'iot-tracking', 'qc-verification',
  'compliance-marketplace', 'analytics', 'logistics', 'product-monitoring', 'traces',
]

export const ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  tenant_admin: Object.fromEntries(
    ALL_MODULES.map(m => [m, FULL_ACCESS])
  ) as PermissionMap,
  operations_manager: Object.fromEntries(
    ALL_MODULES.map(m => [m, m === 'settings' || m === 'users' ? READ_ONLY : READ_WRITE])
  ) as PermissionMap,
  quality_controller: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_ONLY, 'fertilizer-apps': READ_ONLY,
    'pest-disease-mgmts': READ_ONLY, 'harvest-traceabilities': READ_ONLY,
    procurement: READ_ONLY, processing: READ_ONLY,
    'cert-assessments': READ_WRITE, 'coffee-inspections': READ_WRITE,
    'qc-verification': READ_WRITE,
    'eudr-compliance': READ_WRITE, 'deforestation': READ_ONLY,
    'smart-contracts': READ_ONLY, marketplace: READ_ONLY,
    'trading-desk': READ_ONLY, shipments: READ_ONLY, logistics: READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
    analytics: READ_ONLY, 'product-monitoring': READ_ONLY,
  } as PermissionMap,
  field_officer: {
    farmers: READ_WRITE, farmlands: READ_WRITE, cultivations: READ_WRITE,
    nurseries: READ_WRITE, 'land-preparations': READ_WRITE,
    'crop-monitorings': READ_WRITE, 'fertilizer-apps': READ_WRITE,
    'pest-disease-mgmts': READ_WRITE, 'harvest-traceabilities': READ_WRITE,
    procurement: READ_CREATE, processing: READ_ONLY,
    'cert-assessments': READ_ONLY, 'coffee-inspections': READ_ONLY,
    'smart-contracts': READ_ONLY, marketplace: READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
  } as PermissionMap,
  trader: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_ONLY, 'fertilizer-apps': READ_ONLY,
    'pest-disease-mgmts': READ_ONLY, 'harvest-traceabilities': READ_ONLY,
    procurement: READ_ONLY, processing: READ_ONLY,
    'cert-assessments': READ_ONLY, 'coffee-inspections': READ_ONLY,
    'smart-contracts': READ_WRITE, marketplace: READ_WRITE,
    'trading-desk': READ_WRITE, shipments: READ_WRITE, logistics: READ_WRITE,
    'export-docs': READ_WRITE, buyers: READ_WRITE,
    'eudr-compliance': READ_ONLY, 'deforestation': READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
    analytics: READ_ONLY, 'product-monitoring': READ_ONLY,
  } as PermissionMap,
  finance_manager: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_ONLY, 'fertilizer-apps': READ_ONLY,
    'pest-disease-mgmts': READ_ONLY, 'harvest-traceabilities': READ_ONLY,
    procurement: READ_WRITE, processing: READ_ONLY,
    'cert-assessments': READ_ONLY, 'coffee-inspections': READ_ONLY,
    'smart-contracts': READ_WRITE, marketplace: READ_ONLY,
    'trading-desk': READ_WRITE, shipments: READ_ONLY, logistics: READ_ONLY,
    'export-docs': READ_ONLY, buyers: READ_ONLY,
    'eudr-compliance': READ_ONLY, 'deforestation': READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
    analytics: READ_WRITE, 'product-monitoring': READ_ONLY,
  } as PermissionMap,
  buyer: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_ONLY, 'fertilizer-apps': READ_ONLY,
    'pest-disease-mgmts': READ_ONLY, 'harvest-traceabilities': READ_ONLY,
    procurement: READ_ONLY, processing: READ_ONLY,
    'cert-assessments': READ_ONLY, 'coffee-inspections': READ_ONLY,
    'smart-contracts': READ_ONLY, marketplace: READ_ONLY,
    'trading-desk': READ_ONLY, shipments: READ_ONLY, logistics: READ_ONLY,
    'export-docs': READ_ONLY, buyers: READ_WRITE,
    'eudr-compliance': READ_ONLY, 'deforestation': READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
    analytics: READ_ONLY, 'product-monitoring': READ_ONLY,
  } as PermissionMap,
  manager: Object.fromEntries(
    ALL_MODULES.map(m => [m, m === 'settings' || m === 'users' ? READ_ONLY : READ_WRITE])
  ) as PermissionMap,
  inspector: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_CREATE, 'fertilizer-apps': READ_ONLY,
    'pest-disease-mgmts': READ_CREATE, 'harvest-traceabilities': READ_CREATE,
    procurement: READ_ONLY, processing: READ_ONLY,
    'cert-assessments': READ_WRITE, 'coffee-inspections': READ_WRITE,
    'smart-contracts': READ_ONLY, marketplace: READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
  } as PermissionMap,
  farmer: {
    farmers: READ_ONLY, farmlands: READ_ONLY, cultivations: READ_ONLY,
    nurseries: READ_ONLY, 'land-preparations': READ_ONLY,
    'crop-monitorings': READ_CREATE, 'fertilizer-apps': READ_CREATE,
    'pest-disease-mgmts': READ_CREATE, 'harvest-traceabilities': READ_CREATE,
    procurement: READ_ONLY, processing: READ_ONLY,
    'cert-assessments': READ_ONLY, 'coffee-inspections': READ_ONLY,
    'smart-contracts': READ_ONLY, marketplace: READ_ONLY,
    dashboard: READ_ONLY, reports: READ_ONLY, settings: READ_ONLY, users: READ_ONLY,
  } as PermissionMap,
  viewer: Object.fromEntries(
    ALL_MODULES.map(m => [m, ['read'] as Action[]])
  ) as PermissionMap,
  aggregator: {
    ...Object.fromEntries(ALL_MODULES.map(m => [m, READ_ONLY as Action[]])) as PermissionMap,
    'eudr-compliance': READ_WRITE,
    'export-docs': READ_WRITE,
    farmers: ['read', 'update'] as Action[],
    farmlands: ['read', 'update'] as Action[],
    shipments: ['read'] as Action[],
    buyers: ['read'] as Action[],
    'deforestation': ['read'] as Action[],
  } as PermissionMap,
  processor: {
    ...Object.fromEntries(ALL_MODULES.map(m => [m, READ_ONLY as Action[]])) as PermissionMap,
    'eudr-compliance': READ_WRITE,
    'export-docs': READ_WRITE,
    shipments: READ_WRITE,
    processing: READ_WRITE,
    buyers: ['read'] as Action[],
    'trading-desk': ['read'] as Action[],
    'deforestation': ['read'] as Action[],
  } as PermissionMap,
  exporter: {
    ...Object.fromEntries(ALL_MODULES.map(m => [m, READ_ONLY as Action[]])) as PermissionMap,
    ...Object.fromEntries(B2B_MODULES.map(m => [m, FULL_ACCESS])) as PermissionMap,
  } as PermissionMap,
}

export function hasPermission(role: string, module: ModuleSlug, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  const actions = permissions[module]
  if (!actions) return false
  return actions.includes(action)
}

// ════════════════════════════════════════════════════════════════
// API ROUTE HELPERS
// ════════════════════════════════════════════════════════════════

export async function getAuthUser(req?: Request | null): Promise<AuthenticatedUser | null> {
  // 1. Try JWT Bearer token first (for mobile app clients)
  if (req) {
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>
        return {
          id: decoded.id as string,
          email: decoded.email as string,
          name: decoded.name as string,
          role: decoded.role as PlatformRole | TenantRole,
          tenantId: decoded.tenantId as string | undefined,
          tenantSlug: decoded.tenantSlug as string | undefined,
          tenantName: decoded.tenantName as string | undefined,
          currency: decoded.currency as string | undefined,
          currencySymbol: decoded.currencySymbol as string | undefined,
          language: decoded.language as string | undefined,
          isPlatformAdmin: decoded.isPlatformAdmin as boolean | undefined,
        }
      } catch {
        // Invalid or expired JWT, fall through to session auth
      }
    }
  }

  // 2. Fall back to NextAuth session (for web browser clients)
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user as unknown as AuthenticatedUser
}

export function requireAuth(user: AuthenticatedUser | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }
  return null // No error — proceed
}

export function requirePlatformAdmin(user: AuthenticatedUser | null): NextResponse | null {
  const authError = requireAuth(user)
  if (authError) return authError
  if (!user!.isPlatformAdmin) {
    return NextResponse.json({ success: false, error: 'Platform admin access required' }, { status: 403 })
  }
  return null
}

export function requireTenantAccess(user: AuthenticatedUser | null, module: ModuleSlug, action: Action): NextResponse | null {
  const authError = requireAuth(user)
  if (authError) return authError
  if (user!.isPlatformAdmin) return null // Platform admins bypass tenant RBAC
  if (!user!.tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant context required' }, { status: 403 })
  }
  if (!hasPermission(user!.role, module, action)) {
    return NextResponse.json({ success: false, error: `Insufficient permissions: ${action} on ${module}` }, { status: 403 })
  }
  return null
}

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or a NextResponse error.
 */
export function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { error: NextResponse.json({ success: false, error: `Validation failed: ${errors}` }, { status: 400 }) }
  }
  return { data: result.data }
}

/**
 * Standard API response helper
 */
export function apiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Tenant-scoped pagination params extractor
 */
export function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  return {
    page: Math.max(1, parseInt(url.searchParams.get('page') || '1')),
    pageSize: Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20'))),
    search: url.searchParams.get('search') || undefined,
    sortBy: url.searchParams.get('sortBy') || 'createdAt',
    sortOrder: (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
  }
}
