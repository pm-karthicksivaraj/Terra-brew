/**
 * RBAC (Role-Based Access Control) utilities for API routes.
 *
 * Provides server-side helpers to check whether the current session user
 * has access to a given module at a required access level.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MODULES, type EntityType, type TenantRole, type AccessLevel } from '@/lib/module-config'

/**
 * Check if the current user has access to a module.
 *
 * @param moduleSlug     The slug of the module (e.g. 'farmers', 'eudr-compliance')
 * @param requiredAccess Minimum access level required ('view' or 'full')
 * @returns              An object with `allowed`, the effective `accessLevel`,
 *                       and the user's `entityType` and `role`
 */
export async function checkModuleAccess(
  moduleSlug: string,
  requiredAccess: AccessLevel = 'view',
): Promise<{
  allowed: boolean
  accessLevel: AccessLevel
  entityType: EntityType
  role: TenantRole
}> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      allowed: false,
      accessLevel: 'hidden',
      entityType: 'producer' as EntityType,
      role: 'viewer' as TenantRole,
    }
  }

  // Platform admin has full access to everything
  if ((session.user as any).isPlatformAdmin) {
    return {
      allowed: true,
      accessLevel: 'full',
      entityType: 'producer' as EntityType,
      role: 'tenant_admin' as TenantRole,
    }
  }

  const entityType = ((session.user as any).entityType || 'producer') as EntityType
  const role = ((session.user as any).role || 'viewer') as TenantRole

  const mod = MODULES.find(m => m.slug === moduleSlug)
  if (!mod) {
    return { allowed: false, accessLevel: 'hidden', entityType, role }
  }

  const entityAccess = mod.entityTypeAccess[entityType]
  const roleAccess = mod.roleAccess[role]

  // Effective access is the more restrictive of entity and role access
  const effectiveAccess: AccessLevel =
    entityAccess === 'hidden' || roleAccess === 'hidden'
      ? 'hidden'
      : entityAccess === 'full' || roleAccess === 'full'
        ? 'full'
        : 'view'

  const allowed =
    requiredAccess === 'view'
      ? effectiveAccess !== 'hidden'
      : effectiveAccess === 'full'

  return { allowed, accessLevel: effectiveAccess, entityType, role }
}

/**
 * Get the tenant ID from the current session.
 *
 * @returns The tenant ID string, or `null` if not authenticated or no tenant
 */
export async function getTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.tenantId || null
}
