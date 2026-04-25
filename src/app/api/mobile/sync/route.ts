/**
 * Mobile Offline Sync API
 *
 * GET  - Returns latest changes since a given timestamp for incremental sync
 * POST - Push offline changes from mobile client (with conflict detection)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, validateBody } from '@/lib/api-middleware'
import { z } from 'zod'

// ════════════════════════════════════════════════════════════════
// SYNC ENTITY TYPES — maps entity names to Prisma models
// ════════════════════════════════════════════════════════════════

const SYNC_ENTITIES = [
  'farmers', 'farmlands', 'cultivations', 'harvests',
  'procurements', 'processing', 'inspections',
  'nurseries', 'landPreparations', 'cropMonitorings',
  'fertilizerApps', 'pestDiseaseMgmts', 'certAssessments',
  'smartContracts', 'marketplaceListings',
] as const

type SyncEntity = (typeof SYNC_ENTITIES)[number]

/**
 * Map sync entity name to the corresponding Prisma delegate and select fields.
 */
function getEntityDelegate(entity: SyncEntity) {
  switch (entity) {
    case 'farmers': return db.farmer
    case 'farmlands': return db.farmLand
    case 'cultivations': return db.cultivation
    case 'harvests': return db.harvestTraceability
    case 'procurements': return db.procurementRecord
    case 'processing': return db.processingJobOrder
    case 'inspections': return db.coffeeInspection
    case 'nurseries': return db.nursery
    case 'landPreparations': return db.landPreparation
    case 'cropMonitorings': return db.cropMonitoring
    case 'fertilizerApps': return db.fertilizerApplication
    case 'pestDiseaseMgmts': return db.pestDiseaseManagement
    case 'certAssessments': return db.certAssessment
    case 'smartContracts': return db.smartContract
    case 'marketplaceListings': return db.marketplaceListing
    default: return null
  }
}

// ════════════════════════════════════════════════════════════════
// PUSH CHANGE SCHEMA
// ════════════════════════════════════════════════════════════════

const syncChangeSchema = z.object({
  entity: z.string().min(1),
  action: z.enum(['create', 'update', 'delete']),
  data: z.record(z.string(), z.unknown()),
  clientTimestamp: z.string(),
  clientId: z.string().optional(),
})

const pushSyncSchema = z.object({
  changes: z.array(syncChangeSchema).min(1).max(500),
})

/**
 * GET /api/mobile/sync — Pull incremental changes since a timestamp
 * Query: ?since=2024-01-01T00:00:00Z&entities=farmers,harvests,procurements
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const sinceParam = url.searchParams.get('since')
    const entitiesParam = url.searchParams.get('entities')

    if (!sinceParam) {
      return apiError('since query parameter is required (ISO 8601 timestamp)', 400)
    }

    const sinceDate = new Date(sinceParam)
    if (isNaN(sinceDate.getTime())) {
      return apiError('Invalid since timestamp format', 400)
    }

    const tenantId = user!.tenantId!

    // Parse requested entities (default to all)
    const requestedEntities: SyncEntity[] = entitiesParam
      ? entitiesParam.split(',').filter((e): e is SyncEntity => SYNC_ENTITIES.includes(e as SyncEntity))
      : [...SYNC_ENTITIES]

    if (requestedEntities.length === 0) {
      return apiError('No valid entities specified', 400)
    }

    // Fetch modified records for each entity type
    const result: Record<string, unknown[]> = {}

    for (const entity of requestedEntities) {
      const delegate = getEntityDelegate(entity)
      if (!delegate) continue

      try {
        const records = await (delegate as any).findMany({
          where: {
            tenantId,
            updatedAt: { gt: sinceDate },
            isActive: true,
          },
          orderBy: { updatedAt: 'asc' },
          take: 1000, // Limit per entity type
        })
        result[entity] = records
      } catch {
        result[entity] = []
      }
    }

    const serverTimestamp = new Date().toISOString()

    return apiResponse({
      ...result,
      serverTimestamp,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

/**
 * POST /api/mobile/sync — Push offline changes from mobile
 * Body: { changes: [ { entity, action, data, clientTimestamp, clientId } ] }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const validation = validateBody(pushSyncSchema, body)
    if ('error' in validation) return validation.error

    const { changes } = validation.data
    const tenantId = user!.tenantId!
    const userId = user!.id

    let applied = 0
    const conflicts: Array<{
      entity: string
      action: string
      reason: string
      serverData?: Record<string, unknown>
      clientData?: Record<string, unknown>
    }> = []

    // Process all changes in a transaction
    await db.$transaction(async (tx) => {
      for (const change of changes) {
        const { entity, action, data, clientTimestamp } = change
        const clientDate = new Date(clientTimestamp)

        const delegate = getEntityDelegate(entity as SyncEntity)
        if (!delegate) {
          conflicts.push({
            entity,
            action,
            reason: `Unknown entity type: ${entity}`,
          })
          continue
        }

        // Strip tenantId from data — always set from session
        const cleanData = { ...data }
        delete cleanData.tenantId
        delete cleanData.id // Never allow client to set ID on create

        try {
          if (action === 'create') {
            // Create a new record
            await (tx as any)[getTxModelName(entity)].create({
              data: {
                ...cleanData,
                tenantId,
                createdBy: userId,
              },
            })
            applied++
          } else if (action === 'update') {
            const recordId = data.id as string
            if (!recordId) {
              conflicts.push({
                entity,
                action,
                reason: 'Missing record ID for update',
              })
              continue
            }

            // Check for conflict: if server updatedAt > clientTimestamp, it's a conflict
            const existing = await (tx as any)[getTxModelName(entity)].findUnique({
              where: { id: recordId },
            })

            if (!existing) {
              conflicts.push({
                entity,
                action,
                reason: 'Record not found on server',
              })
              continue
            }

            if (existing.tenantId !== tenantId) {
              conflicts.push({
                entity,
                action,
                reason: 'Record does not belong to your tenant',
              })
              continue
            }

            // Conflict detection
            if (new Date(existing.updatedAt) > clientDate) {
              conflicts.push({
                entity,
                action,
                reason: 'Server record has been modified since client timestamp',
                serverData: { updatedAt: existing.updatedAt },
                clientData: { clientTimestamp },
              })
              continue
            }

            // Apply update
            const updateData = { ...cleanData }
            delete updateData.id
            delete updateData.createdAt
            delete updateData.updatedAt

            await (tx as any)[getTxModelName(entity)].update({
              where: { id: recordId },
              data: updateData,
            })
            applied++
          } else if (action === 'delete') {
            const recordId = data.id as string
            if (!recordId) {
              conflicts.push({
                entity,
                action,
                reason: 'Missing record ID for delete',
              })
              continue
            }

            // Soft-delete
            const existing = await (tx as any)[getTxModelName(entity)].findUnique({
              where: { id: recordId },
            })

            if (!existing) {
              conflicts.push({
                entity,
                action,
                reason: 'Record not found on server',
              })
              continue
            }

            if (existing.tenantId !== tenantId) {
              conflicts.push({
                entity,
                action,
                reason: 'Record does not belong to your tenant',
              })
              continue
            }

            await (tx as any)[getTxModelName(entity)].update({
              where: { id: recordId },
              data: { isActive: false },
            })
            applied++
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          conflicts.push({
            entity,
            action,
            reason: `Server error: ${errMsg}`,
          })
        }
      }
    })

    const serverTimestamp = new Date().toISOString()

    return apiResponse({
      applied,
      conflicts,
      serverTimestamp,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

/**
 * Maps sync entity names to Prisma transaction model names.
 * These correspond to the model names in schema.prisma (camelCase of the model).
 */
function getTxModelName(entity: string): string {
  const map: Record<string, string> = {
    farmers: 'farmer',
    farmlands: 'farmLand',
    cultivations: 'cultivation',
    harvests: 'harvestTraceability',
    procurements: 'procurementRecord',
    processing: 'processingJobOrder',
    inspections: 'coffeeInspection',
    nurseries: 'nursery',
    landPreparations: 'landPreparation',
    cropMonitorings: 'cropMonitoring',
    fertilizerApps: 'fertilizerApplication',
    pestDiseaseMgmts: 'pestDiseaseManagement',
    certAssessments: 'certAssessment',
    smartContracts: 'smartContract',
    marketplaceListings: 'marketplaceListing',
  }
  return map[entity] || entity
}
