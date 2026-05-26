import { db } from '@/lib/db'

export async function writeAuditLog(params: {
  tenantId: string
  userId?: string
  action: 'create' | 'update' | 'delete' | 'export' | 'approve' | 'login' | 'logout'
  entity: string
  entityId?: string
  details?: string
  req?: Request
}) {
  try {
    await db.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.req?.headers?.get('x-forwarded-for') || params.req?.headers?.get('x-real-ip') || undefined,
        userAgent: params.req?.headers?.get('user-agent') || undefined,
      },
    })
  } catch (error) {
    // Audit log failure should never break the main operation
    console.error('Failed to write audit log:', error)
  }
}
