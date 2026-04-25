import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { computeDataHash, computeBlockHash } from '@/lib/crypto'
import type { ChainVerificationResult } from '@/types'

/**
 * Hash Chain API:
 * GET  - List hash chain blocks for a batchId (with chain verification)
 * POST - Add new block to chain (compute hash chain automatically)
 */

export async function GET(req: Request) {
  const user = await getAuthUser()
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const batchId = url.searchParams.get('batchId')
    if (!batchId) return apiError('batchId query parameter is required', 400)

    const tenantId = user!.tenantId!

    const blocks = await db.hashChainBlock.findMany({
      where: { tenantId, batchId, isActive: true },
      orderBy: { blockIndex: 'asc' },
    })

    // Chain verification
    const verification: ChainVerificationResult = {
      valid: true,
      totalBlocks: blocks.length,
      message: blocks.length === 0 ? 'No blocks found for this batch' : 'Chain integrity verified',
    }

    for (let i = 1; i < blocks.length; i++) {
      const prev = blocks[i - 1]
      const curr = blocks[i]

      // Verify previousHash matches previous block's hash
      if (curr.previousHash !== prev.blockHash) {
        verification.valid = false
        verification.brokenAt = curr.blockIndex
        verification.message = `Chain broken at block ${curr.blockIndex}: previousHash mismatch`
        break
      }

      // Verify dataHash
      const expectedDataHash = computeDataHash(curr.data)
      if (curr.dataHash !== expectedDataHash) {
        verification.valid = false
        verification.brokenAt = curr.blockIndex
        verification.message = `Chain broken at block ${curr.blockIndex}: dataHash mismatch`
        break
      }

      // Verify blockHash
      const expectedBlockHash = computeBlockHash(
        curr.dataHash,
        curr.previousHash,
        new Date(curr.timestamp).toISOString()
      )
      if (curr.blockHash !== expectedBlockHash) {
        verification.valid = false
        verification.brokenAt = curr.blockIndex
        verification.message = `Chain broken at block ${curr.blockIndex}: blockHash mismatch`
        break
      }
    }

    return apiResponse({ blocks, verification })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const { batchId, stage, data } = body

    if (!batchId || !stage || !data) {
      return apiError('batchId, stage, and data are required', 400)
    }

    const tenantId = user!.tenantId!

    // Find the latest block for this batch to chain from
    const latestBlock = await db.hashChainBlock.findFirst({
      where: { tenantId, batchId, isActive: true },
      orderBy: { blockIndex: 'desc' },
    })

    const blockIndex = latestBlock ? latestBlock.blockIndex + 1 : 0
    const previousHash = latestBlock ? latestBlock.blockHash : '0'.repeat(64) // Genesis block uses zero hash
    const timestamp = new Date().toISOString()

    // Compute hashes
    const dataHash = computeDataHash(typeof data === 'string' ? data : JSON.stringify(data))
    const blockHash = computeBlockHash(dataHash, previousHash, timestamp)

    const block = await db.hashChainBlock.create({
      data: {
        tenantId,
        batchId,
        blockIndex,
        stage,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        dataHash,
        previousHash,
        blockHash,
        timestamp: new Date(timestamp),
        recordedBy: user!.id,
      },
    })

    return apiResponse(block, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
