# Task 2-b: RBAC UI Wiring — Work Record

## Agent: RBAC Wiring Agent

## Summary
Wired up the RBAC UI so the sidebar dynamically shows/hides modules based on user session, re-enabled middleware with role-based route protection, and created API-level RBAC utilities.

## Changes Made

### 1. DashboardShell Session Passing (`src/components/layout/dashboard-shell.tsx`)
- Changed `userRole` default fallback from `''` (empty string) to `'viewer'`
- Session was already wired: `useSession()` → `session?.user?.role` / `session?.user?.entityType` → AppSidebar props
- This ensures the sidebar always has a valid role for `getGroupedNavigation()`

### 2. Middleware Re-enabled (`src/middleware.ts`)
- Created new `middleware.ts` (was `.bak`)
- Uses `getToken()` from `next-auth/jwt` to decode JWT
- Role-based protection:
  - `/super-admin/*` routes require `isPlatformAdmin === true`, else redirect to `/dashboard`
  - Unauthenticated users on protected routes redirect to `/login` with `callbackUrl`
  - `/eudr-compliance/*` routes accessible to all authenticated users
  - All original public routes preserved

### 3. API-Level RBAC (`src/lib/rbac.ts`)
- `checkModuleAccess(moduleSlug, requiredAccess)` — server-side check against MODULES matrix
  - Returns `{ allowed, accessLevel, entityType, role }`
  - Platform admins get full access by default
  - Access level is the more restrictive of entity-type and role access
- `getTenantId()` — returns tenant ID from session or null

## Files Modified
- `src/components/layout/dashboard-shell.tsx` (1 line change)
- `src/middleware.ts` (new, 99 lines)
- `src/lib/rbac.ts` (new, 84 lines)
- `worklog.md` (appended)
