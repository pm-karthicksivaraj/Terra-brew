/**
 * Public QR/NFC Verification API (NO AUTH REQUIRED)
 *
 * GET: Consumer-facing endpoint for scanning QR codes or NFC tags.
 * Returns traceability data with masked PII and chain integrity verification.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyQRSignature, computeDataHash, computeBlockHash, maskString, maskEmail, maskPhone } from '@/lib/crypto'

const ENTITY_MODELS: Record<string, { include: Record<string, boolean> }> = {
  Farmer: { include: {} },
  FarmLand: { include: { farmer: true } },
  Cultivation: { include: { farmer: true, farmLand: true } },
  HarvestTraceability: { include: { farmer: true, farmLand: true } },
  ProcurementRecord: { include: { farmer: true, collectionCentre: true } },
  ProcessingJobOrder: { include: {} },
}

/**
 * Mask PII fields in entity details for consumer-facing responses.
 * - Farmer name: partial mask (show first 2 chars + ***)
 * - National ID: fully hidden
 * - Contact number: masked
 * - Email: masked
 */
function maskEntityPII(entityType: string, details: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...details }

  if (entityType === 'Farmer' || entityType === 'NFC_Farmer') {
    if (masked.fullName) {
      const name = String(masked.fullName)
      masked.fullName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
    }
    if (masked.firstName) masked.firstName = '***'
    if (masked.lastName) masked.lastName = '***'
    if (masked.middleName) masked.middleName = '***'
    if (masked.nationalIdNo) masked.nationalIdNo = '********'
    if (masked.contactNumber) masked.contactNumber = maskPhone(String(masked.contactNumber))
    if (masked.email) masked.email = maskEmail(String(masked.email))
    if (masked.idProofPhoto) masked.idProofPhoto = undefined
    if (masked.farmerPhoto) masked.farmerPhoto = undefined
  }

  // Mask farmer info in related entities
  if (masked.farmer && typeof masked.farmer === 'object' && masked.farmer !== null) {
    const farmer = masked.farmer as Record<string, unknown>
    if (farmer.fullName) {
      const name = String(farmer.fullName)
      farmer.fullName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
    }
    if (farmer.nationalIdNo) farmer.nationalIdNo = '********'
    if (farmer.contactNumber) farmer.contactNumber = maskPhone(String(farmer.contactNumber))
    if (farmer.email) farmer.email = maskEmail(String(farmer.email))
    if (farmer.firstName) farmer.firstName = '***'
    if (farmer.lastName) farmer.lastName = '***'
  }

  return masked
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code is required' },
        { status: 400 }
      )
    }

    // Look up the QR/NFC verification record
    const qrRecord = await db.qRVerification.findFirst({
      where: { qrCode, isActive: true },
    })

    if (!qrRecord) {
      return NextResponse.json({
        success: true,
        data: {
          qrCode,
          status: 'not_found',
          message: 'QR code not found in system',
          entityType: null,
          entityId: null,
          signatureValid: false,
          chainIntegrity: { valid: false, totalBlocks: 0 },
          traceSteps: [],
          entityDetails: null,
          scanCount: 0,
          lastScannedAt: null,
        },
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

    // Fetch entity details based on type (strip NFC_ prefix for lookup)
    const lookupType = qrRecord.entityType.startsWith('NFC_')
      ? qrRecord.entityType.substring(4)
      : qrRecord.entityType
    const entityId = qrRecord.entityId
    let entityDetails: Record<string, unknown> | null = null

    try {
      const modelConfig = ENTITY_MODELS[lookupType]
      const include = modelConfig?.include || {}

      switch (lookupType) {
        case 'Farmer':
          entityDetails = await db.farmer.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'FarmLand':
          entityDetails = await db.farmLand.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'Cultivation':
          entityDetails = await db.cultivation.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'HarvestTraceability':
          entityDetails = await db.harvestTraceability.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'ProcurementRecord':
          entityDetails = await db.procurementRecord.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
        case 'ProcessingJobOrder':
          entityDetails = await db.processingJobOrder.findFirst({
            where: { id: entityId, isActive: true },
            include,
          }) as unknown as Record<string, unknown>
          break
      }
    } catch {
      // Entity may not exist anymore
    }

    // Mask PII for consumer view
    if (entityDetails) {
      entityDetails = maskEntityPII(qrRecord.entityType, entityDetails)
    }

    // Fetch and verify hash chain for the batch
    let chainIntegrity = { valid: true, totalBlocks: 0 }
    let traceSteps: Array<{
      blockIndex: number
      stage: string
      timestamp: string
      dataHash: string
      blockHash: string
    }> = []

    // Try to find a batchId from the entity for chain verification
    const batchId = entityDetails
      ? (entityDetails as Record<string, unknown>).batchId as string | undefined
      : undefined

    if (batchId) {
      const blocks = await db.hashChainBlock.findMany({
        where: { tenantId: qrRecord.tenantId, batchId, isActive: true },
        orderBy: { blockIndex: 'asc' },
      })

      chainIntegrity.totalBlocks = blocks.length

      // Verify chain integrity
      for (let i = 1; i < blocks.length; i++) {
        const prev = blocks[i - 1]
        const curr = blocks[i]

        if (curr.previousHash !== prev.blockHash) {
          chainIntegrity.valid = false
          break
        }

        const expectedDataHash = computeDataHash(curr.data)
        if (curr.dataHash !== expectedDataHash) {
          chainIntegrity.valid = false
          break
        }

        const expectedBlockHash = computeBlockHash(
          curr.dataHash,
          curr.previousHash,
          new Date(curr.timestamp).toISOString()
        )
        if (curr.blockHash !== expectedBlockHash) {
          chainIntegrity.valid = false
          break
        }
      }

      // Build trace steps (consumer-friendly)
      traceSteps = blocks.map((block) => ({
        blockIndex: block.blockIndex,
        stage: block.stage,
        timestamp: new Date(block.timestamp).toISOString(),
        dataHash: block.dataHash,
        blockHash: block.blockHash,
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        entityType: qrRecord.entityType,
        entityId: qrRecord.entityId,
        signatureValid,
        chainIntegrity,
        traceSteps,
        entityDetails,
        scanCount: qrRecord.scanCount + 1,
        lastScannedAt: qrRecord.lastScannedAt,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    )
  }
}
