import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { signQRPayload, verifyQRSignature } from '@/lib/crypto'

/**
 * QR Verification API:
 * GET  - Look up QR code, return entity details + verification status
 * POST - Generate QR code for an entity, store in QRVerification table
 */

const ENTITY_MODELS: Record<string, { include: Record<string, boolean> }> = {
  Farmer: { include: {} },
  FarmLand: { include: { farmer: true } },
  Cultivation: { include: { farmer: true, farmLand: true } },
  HarvestTraceability: { include: { farmer: true, farmLand: true } },
  ProcurementRecord: { include: { farmer: true, collectionCentre: true } },
  ProcessingJobOrder: { include: {} },
}

export async function GET(req: Request) {
  const user = await getAuthUser()
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const qrCode = url.searchParams.get('qrCode')
    if (!qrCode) return apiError('qrCode query parameter is required', 400)

    const tenantId = user!.tenantId!

    // Look up the QR verification record
    const qrRecord = await db.qRVerification.findFirst({
      where: { qrCode, isActive: true },
    })

    if (!qrRecord) {
      return apiResponse({
        status: 'not_found',
        message: 'QR code not found in system',
        qrCode,
        entityDetails: null,
        signatureValid: false,
        scanCount: 0,
      })
    }

    // Verify tenant access
    if (qrRecord.tenantId !== tenantId) {
      return apiResponse({
        status: 'not_found',
        message: 'QR code not found in system',
        qrCode,
        entityDetails: null,
        signatureValid: false,
        scanCount: qrRecord.scanCount,
      })
    }

    // Verify HMAC signature
    const payload = `${qrRecord.entityType}:${qrRecord.entityId}`
    const signatureValid = verifyQRSignature(payload, qrRecord.hmacSignature)

    // Increment scan count
    await db.qRVerification.update({
      where: { id: qrRecord.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    })

    // Fetch entity details based on type
    let entityDetails: Record<string, unknown> | null = null
    const entityType = qrRecord.entityType
    const entityId = qrRecord.entityId

    try {
      const modelConfig = ENTITY_MODELS[entityType]
      const include = modelConfig?.include || {}

      switch (entityType) {
        case 'Farmer':
          entityDetails = await db.farmer.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'FarmLand':
          entityDetails = await db.farmLand.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'Cultivation':
          entityDetails = await db.cultivation.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'HarvestTraceability':
          entityDetails = await db.harvestTraceability.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'ProcurementRecord':
          entityDetails = await db.procurementRecord.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'ProcessingJobOrder':
          entityDetails = await db.processingJobOrder.findFirst({
            where: { id: entityId, tenantId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
      }
    } catch {
      // Entity may not exist anymore
    }

    const status = signatureValid ? 'valid' : 'invalid'

    return apiResponse({
      status,
      message: signatureValid
        ? 'QR code verified successfully — chain intact'
        : 'QR code signature mismatch — possible tampering detected',
      qrCode,
      entityType: qrRecord.entityType,
      entityId: qrRecord.entityId,
      entityDetails,
      signatureValid,
      hmacSignature: qrRecord.hmacSignature,
      scanCount: qrRecord.scanCount + 1,
      lastScannedAt: qrRecord.lastScannedAt,
      createdAt: qrRecord.createdAt,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const { entityType, entityId } = body

    if (!entityType || !entityId) {
      return apiError('entityType and entityId are required', 400)
    }

    const validTypes = Object.keys(ENTITY_MODELS)
    if (!validTypes.includes(entityType)) {
      return apiError(`Invalid entityType. Valid types: ${validTypes.join(', ')}`, 400)
    }

    const tenantId = user!.tenantId!

    // Check if entity exists
    let entityExists = false
    switch (entityType) {
      case 'Farmer':
        entityExists = !!(await db.farmer.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
      case 'FarmLand':
        entityExists = !!(await db.farmLand.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
      case 'Cultivation':
        entityExists = !!(await db.cultivation.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
      case 'HarvestTraceability':
        entityExists = !!(await db.harvestTraceability.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
      case 'ProcurementRecord':
        entityExists = !!(await db.procurementRecord.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
      case 'ProcessingJobOrder':
        entityExists = !!(await db.processingJobOrder.findFirst({ where: { id: entityId, tenantId, isActive: true } }))
        break
    }

    if (!entityExists) {
      return apiError('Entity not found', 404)
    }

    // Check if QR already exists for this entity
    const existingQR = await db.qRVerification.findFirst({
      where: { tenantId, entityType, entityId, isActive: true },
    })

    if (existingQR) {
      return apiResponse({
        qrCode: existingQR.qrCode,
        hmacSignature: existingQR.hmacSignature,
        scanCount: existingQR.scanCount,
        createdAt: existingQR.createdAt,
        message: 'QR code already exists for this entity',
      })
    }

    // Generate QR code payload
    const payload = `${entityType}:${entityId}`
    const hmacSignature = signQRPayload(payload)
    const qrCode = `TB-${entityType.substring(0, 3).toUpperCase()}-${entityId.substring(0, 8)}-${hmacSignature.substring(0, 12)}`

    // Store QR verification record
    const qrRecord = await db.qRVerification.create({
      data: {
        tenantId,
        entityType,
        entityId,
        qrCode,
        hmacSignature,
        scanCount: 0,
      },
    })

    return apiResponse({
      qrCode: qrRecord.qrCode,
      hmacSignature: qrRecord.hmacSignature,
      payload,
      createdAt: qrRecord.createdAt,
      message: 'QR code generated successfully',
    }, 201)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}
