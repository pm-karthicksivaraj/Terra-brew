import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CRON_SECRET = process.env.CRON_SECRET

// Time windows for expiry notifications (in days)
const EXPIRY_WINDOWS = [
  { days: 30, priority: 'normal', label: '30 days' },
  { days: 14, priority: 'high', label: '14 days' },
  { days: 7, priority: 'urgent', label: '7 days' },
] as const

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    checked: 0,
    notificationsCreated: 0,
    ddsExpired: 0,
    errors: [] as string[],
  }

  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Find all accepted DDS that expire within 30 days or have already expired
    const expiringDDS = await db.dueDiligenceStatement.findMany({
      where: {
        status: 'accepted',
        validUntil: { lte: thirtyDaysFromNow },
        isActive: true,
      },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
      },
    })

    // Also find expired DDS that haven't been marked as expired yet
    const alreadyExpired = await db.dueDiligenceStatement.findMany({
      where: {
        status: 'accepted',
        validUntil: { lt: now },
        isActive: true,
      },
    })

    results.checked = expiringDDS.length

    // Process each DDS for upcoming expiry notifications
    for (const dds of expiringDDS) {
      try {
        if (!dds.validUntil) continue

        const daysUntilExpiry = Math.ceil(
          (dds.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Skip if already expired (handled separately below)
        if (daysUntilExpiry <= 0) continue

        for (const window of EXPIRY_WINDOWS) {
          // Check if this DDS falls within the current window
          // For 30-day window: daysUntilExpiry <= 30 AND daysUntilExpiry > 14
          // For 14-day window: daysUntilExpiry <= 14 AND daysUntilExpiry > 7
          // For 7-day window: daysUntilExpiry <= 7 AND daysUntilExpiry > 0
          const nextWindowDays = window.days === 30 ? 14 : window.days === 14 ? 7 : 0
          const inWindow = daysUntilExpiry <= window.days && daysUntilExpiry > nextWindowDays

          if (!inWindow) continue

          // Deduplication: check if a notification for this DDS + window already exists
          const metadataJson = JSON.stringify({ ddsId: dds.id, window: window.days })
          const existingNotification = await db.notification.findFirst({
            where: {
              tenantId: dds.tenantId,
              type: 'dds_expiry',
              metadata: metadataJson,
              createdAt: {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Only check last 7 days
              },
            },
          })

          if (existingNotification) continue

          // Create notification for all users in the tenant (userId = null)
          await db.notification.create({
            data: {
              tenantId: dds.tenantId,
              userId: null, // All users in tenant
              type: 'dds_expiry',
              title: `DDS Expiring in ${window.label}`,
              message: `Due Diligence Statement for "${dds.operatorName}" (EORI: ${dds.operatorEori}) expires on ${dds.validUntil.toISOString().split('T')[0]}. ${daysUntilExpiry} day(s) remaining.`,
              priority: window.priority,
              actionUrl: `/due-diligence-statements?id=${dds.id}`,
              metadata: metadataJson,
              expiresAt: dds.validUntil,
            },
          })

          results.notificationsCreated++
        }
      } catch (err: any) {
        results.errors.push(`DDS ${dds.id}: ${err.message}`)
      }
    }

    // Process already-expired DDS
    for (const dds of alreadyExpired) {
      try {
        if (!dds.validUntil) continue

        const metadataJson = JSON.stringify({ ddsId: dds.id, window: 'expired' })

        // Check for existing expired notification
        const existingNotification = await db.notification.findFirst({
          where: {
            tenantId: dds.tenantId,
            type: 'compliance_alert',
            metadata: metadataJson,
            createdAt: {
              gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Check last 30 days
            },
          },
        })

        if (existingNotification) continue

        // Create urgent compliance alert notification
        await db.notification.create({
          data: {
            tenantId: dds.tenantId,
            userId: null,
            type: 'compliance_alert',
            title: 'DDS Has Expired',
            message: `Due Diligence Statement for "${dds.operatorName}" (EORI: ${dds.operatorEori}) expired on ${dds.validUntil.toISOString().split('T')[0]}. This DDS is no longer valid for EUDR compliance. Immediate action required.`,
            priority: 'urgent',
            actionUrl: `/due-diligence-statements?id=${dds.id}`,
            metadata: metadataJson,
          },
        })

        results.notificationsCreated++

        // Update DDS status to expired
        await db.dueDiligenceStatement.update({
          where: { id: dds.id },
          data: { status: 'expired' },
        })

        results.ddsExpired++

        // Log to audit log
        await db.auditLog.create({
          data: {
            tenantId: dds.tenantId,
            action: 'dds_expired',
            entity: 'DueDiligenceStatement',
            entityId: dds.id,
            details: `DDS for ${dds.operatorName} (${dds.operatorEori}) automatically marked as expired. validUntil: ${dds.validUntil.toISOString()}`,
          },
        })
      } catch (err: any) {
        results.errors.push(`Expired DDS ${dds.id}: ${err.message}`)
      }
    }

    // Log the cron run
    console.log('[Cron] DDS Expiry Check completed:', JSON.stringify(results))

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron] DDS Expiry Check failed:', error)
    return NextResponse.json(
      { success: false, error: error.message, data: results },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(req: Request) {
  return GET(req)
}
