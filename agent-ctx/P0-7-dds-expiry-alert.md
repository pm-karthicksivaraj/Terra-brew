# P0-7: DDS Expiry Alert System — Implementation Summary

## Task: Add DDS expiry alert system with cron scheduler and notifications

## Files Created

1. **`src/app/api/cron/dds-expiry-check/route.ts`** — Cron scheduler endpoint
   - Protected by `CRON_SECRET` env var (Authorization: Bearer header)
   - Supports both GET and POST for flexibility
   - Finds accepted DDS with `validUntil` within 30 days
   - Creates notifications at 3 escalation windows:
     - 30 days before → priority: "normal"
     - 14 days before → priority: "high"  
     - 7 days before → priority: "urgent"
   - Already expired DDS → priority: "urgent", type: "compliance_alert"
   - Deduplication: checks existing notifications by DDS ID + window within last 7-30 days
   - Auto-updates expired DDS status to "expired"
   - Logs to AuditLog table

2. **`src/app/api/notifications/route.ts`** — Notifications list & bulk operations
   - GET: List notifications for tenant (userId=null OR userId=currentUser) with pagination, filtering by isRead/type
   - Returns `unreadCount` alongside paginated results
   - PATCH: Mark as read via `{ids: string[]}` or `{markAll: true}`

3. **`src/app/api/notifications/[id]/route.ts`** — Single notification CRUD
   - GET: Single notification (scoped to tenant + user)
   - PUT: Update notification (mark as read)
   - DELETE: Delete notification

4. **`src/components/layout/notification-bell.tsx`** — Notification Bell component
   - Bell icon with unread count badge (red pill with count, shows 99+ for large counts)
   - Popover dropdown showing recent notifications
   - Priority-based styling (urgent=red, high=amber, normal=blue, low=gray)
   - Click notification → mark as read + navigate to actionUrl
   - "Mark all as read" button
   - Individual mark-as-read and dismiss buttons
   - Auto-refreshes every 60 seconds
   - Time-ago formatting for timestamps

5. **`vercel.json`** — Vercel Cron configuration
   - Daily at 6:00 AM UTC: `0 6 * * *`
   - Calls `/api/cron/dds-expiry-check`

## Files Modified

1. **`prisma/schema.prisma`** — Added Notification model + relations
   - New `Notification` model with tenantId, userId, type, title, message, priority, isRead, actionUrl, metadata, expiresAt
   - Added `notifications Notification[]` to Tenant model
   - Added `notifications Notification[]` to User model
   - Ran `prisma db push` and `prisma generate` successfully

2. **`src/components/layout/dashboard-shell.tsx`** — Integrated NotificationBell
   - Imported NotificationBell component
   - Added `<NotificationBell />` between language toggle and user dropdown in the header

## Key Implementation Details

- **Deduplication**: Uses metadata JSON field with `{ddsId, window}` to prevent duplicate notifications within a 7-day lookback window for upcoming expiries and 30-day for already-expired
- **Security**: Cron endpoint requires `CRON_SECRET` Bearer token when the env var is set
- **Tenant isolation**: All notification queries scoped by tenantId + userId (null for broadcast)
- **Auto-refresh**: Bell component polls every 60s using setInterval
- **Expiry escalation**: 3-window system ensures escalating urgency as DDS approaches expiry
- **Audit trail**: Expired DDS automatically logged to AuditLog table
