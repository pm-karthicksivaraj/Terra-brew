/**
 * NFC Tag Management API
 *
 * GET  - List NFC tags for tenant (paginated)
 * POST - Write/create an NFC verification record linked to an entity
 * PUT  - Verify NFC tap (consumer-facing verification)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams, validateBody } from '@/lib/api-middleware'
import { signQRPayload, verifyQRSignature, computeDataHash, computeBlockHash, maskString, maskEmail, maskPhone } from '@/lib/crypto'
import { z } from 'zod'

const VALID_ENTITY_TYPES = [
  'Farmer', 'FarmLand', 'Cultivation', 'HarvestTraceability',
  'ProcurementRecord', 'ProcessingJobOrder',
]

const createNFCSchema = z.object({
  entityType: z.string().min(1, 'Entity type required'),
  entityId: z.string().min(1, 'Entity ID required'),
  nfcTagId: z.string().min(1, 'NFC tag ID required'),
})

const verifyNFCSchema = z.object({
  nfcTagId: z.string().optional(),
  qrCode: z.string().optional(),
}).refine(data => data.nfcTagId || data.qrCode, {
  message: 'Either nfcTagId or qrCode is required',
})

/**
 * GET /api/nfc — List NFC tags for tenant
 * Query: ?page=1&pageSize=20&entityType=HarvestTraceability
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const { page, pageSize } = getPaginationParams(req)
    const url = new URL(req.url)
    const entityTypeFilter = url.searchParams.get('entityType')
    const tenantId = user!.tenantId!

    // Build where clause — NFC tags have entityType starting with "NFC_"
    const where: Record<string, unknown> = {
      tenantId,
      isActive: true,
      qrCode: { startsWith: 'NFC-' },
    }

    if (entityTypeFilter) {
      where.entityType = `NFC_${entityTypeFilter}`
    }

    const [records, total] = await Promise.all([
      db.qRVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.qRVerification.count({ where }),
    ])

    return apiResponse({
      items: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

/**
 * POST /api/nfc — Create an NFC verification record
 * Body: { entityType, entityId, nfcTagId }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const validation = validateBody(createNFCSchema, body)
    if ('error' in validation) return validation.error

    const { entityType, entityId, nfcTagId } = validation.data
    const tenantId = user!.tenantId!

    // Validate entity type
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      return apiError(`Invalid entityType. Valid types: ${VALID_ENTITY_TYPES.join(', ')}`, 400)
    }

    // Check if entity exists in the database
    let entityExists = false
    let batchId: string | undefined
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
      case 'HarvestTraceability': {
        const harvest = await db.harvestTraceability.findFirst({ where: { id: entityId, tenantId, isActive: true } })
        entityExists = !!harvest
        batchId = harvest?.batchId ?? undefined
        break
      }
      case 'ProcurementRecord': {
        const proc = await db.procurementRecord.findFirst({ where: { id: entityId, tenantId, isActive: true } })
        entityExists = !!proc
        batchId = proc?.batchId ?? undefined
        break
      }
      case 'ProcessingJobOrder': {
        const procJob = await db.processingJobOrder.findFirst({ where: { id: entityId, tenantId, isActive: true } })
        entityExists = !!procJob
        batchId = procJob?.batchIdInput ?? undefined
        break
      }
    }

    if (!entityExists) {
      return apiError('Entity not found', 404)
    }

    // Check if NFC tag already exists for this tag ID
    const qrCode = `NFC-${nfcTagId}`
    const existingNFC = await db.qRVerification.findFirst({
      where: { qrCode, isActive: true },
    })

    if (existingNFC) {
      return apiError('NFC tag already registered in the system', 409)
    }

    // Store with NFC_ prefix in entityType to differentiate from QR
    const nfcEntityType = `NFC_${entityType}`
    const payload = `${nfcEntityType}:${entityId}`
    const hmacSignature = signQRPayload(payload)

    const nfcRecord = await db.qRVerification.create({
      data: {
        tenantId,
        entityType: nfcEntityType,
        entityId,
        qrCode,
        hmacSignature,
        scanCount: 0,
      },
    })

    // Create a hash chain block recording the NFC binding event
    if (batchId) {
      const latestBlock = await db.hashChainBlock.findFirst({
        where: { tenantId, batchId, isActive: true },
        orderBy: { blockIndex: 'desc' },
      })

      const blockIndex = latestBlock ? latestBlock.blockIndex + 1 : 0
      const previousHash = latestBlock ? latestBlock.blockHash : '0'.repeat(64)
      const timestamp = new Date().toISOString()
      const chainData = JSON.stringify({
        event: 'nfc_tag_bound',
        nfcTagId,
        entityType: nfcEntityType,
        entityId,
        boundBy: user!.id,
      })
      const dataHash = computeDataHash(chainData)
      const blockHash = computeBlockHash(dataHash, previousHash, timestamp)

      await db.hashChainBlock.create({
        data: {
          tenantId,
          batchId,
          blockIndex,
          stage: 'nfc_binding',
          data: chainData,
          dataHash,
          previousHash,
          blockHash,
          timestamp: new Date(timestamp),
          recordedBy: user!.id,
        },
      })
    }

    return apiResponse({
      qrCode: nfcRecord.qrCode,
      hmacSignature: nfcRecord.hmacSignature,
      nfcTagId,
      entityType: nfcEntityType,
      entityId,
      createdAt: nfcRecord.createdAt,
    }, 201)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

/**
 * PUT /api/nfc — Verify NFC tap (consumer verification)
 * Body: { nfcTagId } or { qrCode }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = validateBody(verifyNFCSchema, body)
    if ('error' in validation) return validation.error

    const { nfcTagId, qrCode: bodyQrCode } = validation.data

    // Determine the qrCode to look up
    const lookupCode = nfcTagId ? `NFC-${nfcTagId}` : bodyQrCode

    if (!lookupCode) {
      return apiError('nfcTagId or qrCode is required', 400)
    }

    // Look up the NFC/QR verification record
    const nfcRecord = await db.qRVerification.findFirst({
      where: { qrCode: lookupCode, isActive: true },
    })

    if (!nfcRecord) {
      return apiResponse({
        status: 'not_found',
        message: 'NFC tag not found in system',
        qrCode: lookupCode,
        signatureValid: false,
        entityDetails: null,
      })
    }

    // Verify HMAC signature
    const payload = `${nfcRecord.entityType}:${nfcRecord.entityId}`
    const signatureValid = verifyQRSignature(payload, nfcRecord.hmacSignature)

    // Increment scan count
    await db.qRVerification.update({
      where: { id: nfcRecord.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    })

    // Fetch entity details
    const lookupType = nfcRecord.entityType.startsWith('NFC_')
      ? nfcRecord.entityType.substring(4)
      : nfcRecord.entityType
    let entityDetails: Record<string, unknown> | null = null

    try {
      switch (lookupType) {
        case 'Farmer':
          entityDetails = await db.farmer.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
          }) as unknown as Record<string, unknown>
          break
        case 'FarmLand':
          entityDetails = await db.farmLand.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
            include: { farmer: true },
          }) as unknown as Record<string, unknown>
          break
        case 'Cultivation':
          entityDetails = await db.cultivation.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
            include: { farmer: true, farmLand: true },
          }) as unknown as Record<string, unknown>
          break
        case 'HarvestTraceability':
          entityDetails = await db.harvestTraceability.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
            include: { farmer: true, farmLand: true },
          }) as unknown as Record<string, unknown>
          break
        case 'ProcurementRecord':
          entityDetails = await db.procurementRecord.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
            include: { farmer: true, collectionCentre: true },
          }) as unknown as Record<string, unknown>
          break
        case 'ProcessingJobOrder':
          entityDetails = await db.processingJobOrder.findFirst({
            where: { id: nfcRecord.entityId, isActive: true },
          }) as unknown as Record<string, unknown>
          break
      }
    } catch {
      // Entity may not exist
    }

    // Mask PII
    if (entityDetails) {
      const masked = { ...entityDetails }
      if (masked.fullName) {
        const name = String(masked.fullName)
        masked.fullName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
      }
      if (masked.nationalIdNo) masked.nationalIdNo = '********'
      if (masked.contactNumber) masked.contactNumber = maskPhone(String(masked.contactNumber))
      if (masked.email) masked.email = maskEmail(String(masked.email))

      if (masked.farmer && typeof masked.farmer === 'object' && masked.farmer !== null) {
        const farmer = masked.farmer as Record<string, unknown>
        if (farmer.fullName) {
          const name = String(farmer.fullName)
          farmer.fullName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
        }
        if (farmer.nationalIdNo) farmer.nationalIdNo = '********'
        if (farmer.contactNumber) farmer.contactNumber = maskPhone(String(farmer.contactNumber))
      }
      entityDetails = masked
    }

    const isNFC = nfcRecord.entityType.startsWith('NFC_')

    return apiResponse({
      status: signatureValid ? 'valid' : 'invalid',
      message: signatureValid
        ? `${isNFC ? 'NFC tag' : 'QR code'} verified successfully`
        : 'Signature mismatch — possible tampering detected',
      qrCode: nfcRecord.qrCode,
      entityType: nfcRecord.entityType,
      entityId: nfcRecord.entityId,
      signatureValid,
      isNFC,
      entityDetails,
      scanCount: nfcRecord.scanCount + 1,
      lastScannedAt: nfcRecord.lastScannedAt,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}
