---
Task ID: 4+5
Agent: Sidebar + Audit Fixer
Task: Fix sidebar progressive disclosure + audit log access

Work Log:
- Modified `/api/modules/route.ts` to support tenant users — returns `enabledSlugs` array from TenantModule table
- Modified `getGroupedNavigation()` in `module-config.ts` to accept optional 3rd param `enabledSlugs?: string[]`
- When enabledSlugs is provided, filters out modules whose slug is NOT in the enabled list
- When not provided (platform admin), all modules are shown (existing behavior)
- Added `useEffect` in `dashboard-shell.tsx` that fetches enabled modules from `/api/modules` on mount
- Added `enabledModuleSlugs` state and prop passing from DashboardShell → AppSidebar → SidebarContent → getGroupedNavigation
- Updated `SidebarContent`, `AppSidebarProps`, and both SidebarContent usages (desktop + mobile) in `app-sidebar.tsx`
- Fixed audit-logs route: replaced `requirePlatformAdmin` with `requireAuth` + tenant-scoped filtering
- Platform admins can see all logs; tenant users only see their own tenant's logs
- Created `/lib/audit.ts` helper utility with `writeAuditLog()` function
- Added `writeAuditLog` calls after successful operations in 8 critical CRUD routes:
  1. `/api/farmers/route.ts` — POST (create) and PUT (update)
  2. `/api/farmlands/route.ts` — POST (create) and PUT (update)
  3. `/api/eudr-compliance/route.ts` — POST (create)
  4. `/api/export-docs/route.ts` — POST (create)
  5. `/api/shipments/route.ts` — POST (create)
  6. `/api/buyers/route.ts` — POST (create)
  7. `/api/users/route.ts` — POST (create) and PUT (update)

Stage Summary:
- Sidebar now properly hides modules disabled for a tenant via progressive disclosure
- Tenant admins can now see their own audit logs (scoped to their tenantId)
- Audit logs are written for critical CRUD operations (create/update on farmers, farmlands, eudr-compliance, export-docs, shipments, buyers, users)
