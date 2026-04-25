/**
 * On-Chain Anchoring API
 *
 * POST: Anchor a batch's entire hash chain on-chain (simulated).
 *       Creates a Merkle root from all block hashes and stores an anchor block.
 * GET:  Get anchor status for a batch.
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, validateBody } from '@/lib/api-middleware'
import { computeDataHash, computeBlockHash } from '@/lib/crypto'
import { z } from 'zod'

const anchorSchema = z.object({
  batchId: z.string().min(1, 'Batch ID required'),
})

/**
 * Simple Merkle root computation from an array of hashes.
 * Pads to even number of leaves by duplicating the last leaf if odd.
 */
function computeMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return crypto.createHash('sha256').update('').digest('hex')
  if (hashes.length === 1) return hashes[0]

  let currentLevel = [...hashes]

  while (currentLevel.length > 1) {
    // Pad if odd
    if (currentLevel.length % 2 !== 0) {
      currentLevel.push(currentLevel[currentLevel.length - 1])
    }

    const nextLevel: string[] = []
    for (let i = 0; i < currentLevel.length; i += 2) {
      const combined = currentLevel[i] + currentLevel[i + 1]
      nextLevel.push(crypto.createHash('sha256').update(combined).digest('hex'))
    }
    currentLevel = nextLevel
  }

  return currentLevel[0]
}

/**
 * POST /api/on-chain/anchor — Anchor a batch's hash chain on-chain
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const validation = validateBody(anchorSchema, body)
    if ('error' in validation) return validation.error

    const { batchId } = validation.data
    const tenantId = user!.tenantId!

    // Fetch all hash chain blocks for this batch
    const blocks = await db.hashChainBlock.findMany({
      where: { tenantId, batchId, isActive: true },
      orderBy: { blockIndex: 'asc' },
    })

    if (blocks.length === 0) {
      return apiError('No hash chain blocks found for this batch', 404)
    }

    // Check if already anchored
    const existingAnchor = await db.hashChainBlock.findFirst({
      where: { tenantId, batchId, stage: 'on_chain_anchor', isActive: true },
    })

    if (existingAnchor) {
      // Parse existing anchor data
      let anchorData: Record<string, unknown> = {}
      try {
        anchorData = JSON.parse(existingAnchor.data)
      } catch {
        // ignore parse error
      }

      return apiResponse({
        message: 'Batch already anchored on-chain',
        anchor: {
          id: existingAnchor.id,
          blockIndex: existingAnchor.blockIndex,
          ...anchorData,
          blockHash: existingAnchor.blockHash,
          anchoredAt: existingAnchor.timestamp,
        },
        verificationUrl: `/api/on-chain/anchor?batchId=${batchId}`,
        alreadyAnchored: true,
      })
    }

    // Verify chain integrity before anchoring
    for (let i = 1; i < blocks.length; i++) {
      const prev = blocks[i - 1]
      const curr = blocks[i]

      if (curr.previousHash !== prev.blockHash) {
        return apiError(`Chain integrity broken at block ${curr.blockIndex}: cannot anchor compromised chain`, 400)
      }

      const expectedDataHash = computeDataHash(curr.data)
      if (curr.dataHash !== expectedDataHash) {
        return apiError(`Chain integrity broken at block ${curr.blockIndex}: dataHash mismatch`, 400)
      }

      const expectedBlockHash = computeBlockHash(
        curr.dataHash,
        curr.previousHash,
        new Date(curr.timestamp).toISOString()
      )
      if (curr.blockHash !== expectedBlockHash) {
        return apiError(`Chain integrity broken at block ${curr.blockIndex}: blockHash mismatch`, 400)
      }
    }

    // Compute Merkle root from all block hashes
    const blockHashes = blocks.map(b => b.blockHash)
    const merkleRoot = computeMerkleRoot(blockHashes)
    const firstBlockHash = blocks[0].blockHash
    const lastBlockHash = blocks[blocks.length - 1].blockHash

    // Create anchor block in the hash chain
    const latestBlock = blocks[blocks.length - 1]
    const anchorBlockIndex = latestBlock.blockIndex + 1
    const previousHash = latestBlock.blockHash
    const timestamp = new Date().toISOString()

    const anchorData = {
      event: 'on_chain_anchor',
      merkleRoot,
      blockCount: blocks.length,
      firstBlockHash,
      lastBlockHash,
      anchoredAt: timestamp,
      anchoredBy: user!.id,
      // Simulated blockchain transaction ID
      txHash: `0x${crypto.createHash('sha256').update(merkleRoot + timestamp).digest('hex').substring(0, 64)}`,
      network: 'ethereum-sepolia-testnet',
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
    }

    const anchorDataStr = JSON.stringify(anchorData)
    const dataHash = computeDataHash(anchorDataStr)
    const blockHash = computeBlockHash(dataHash, previousHash, timestamp)

    const anchorBlock = await db.hashChainBlock.create({
      data: {
        tenantId,
        batchId,
        blockIndex: anchorBlockIndex,
        stage: 'on_chain_anchor',
        data: anchorDataStr,
        dataHash,
        previousHash,
        blockHash,
        timestamp: new Date(timestamp),
        recordedBy: user!.id,
      },
    })

    return apiResponse({
      message: 'Batch successfully anchored on-chain',
      anchor: {
        id: anchorBlock.id,
        batchId,
        blockIndex: anchorBlockIndex,
        merkleRoot,
        blockCount: blocks.length,
        firstBlockHash,
        lastBlockHash,
        txHash: anchorData.txHash,
        network: anchorData.network,
        blockNumber: anchorData.blockNumber,
        anchoredAt: timestamp,
        anchorBlockHash: blockHash,
      },
      verificationUrl: `/api/on-chain/anchor?batchId=${batchId}`,
    }, 201)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

/**
 * GET /api/on-chain/anchor — Get anchor status for a batch
 * Query: ?batchId=xxx
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const batchId = url.searchParams.get('batchId')
    if (!batchId) return apiError('batchId query parameter is required', 400)

    const tenantId = user!.tenantId!

    // Find the on-chain anchor block
    const anchorBlock = await db.hashChainBlock.findFirst({
      where: { tenantId, batchId, stage: 'on_chain_anchor', isActive: true },
    })

    if (!anchorBlock) {
      return apiResponse({
        anchored: false,
        batchId,
        anchor: null,
      })
    }

    // Parse anchor data
    let anchorData: Record<string, unknown> = {}
    try {
      anchorData = JSON.parse(anchorBlock.data)
    } catch {
      // ignore parse error
    }

    return apiResponse({
      anchored: true,
      batchId,
      anchor: {
        id: anchorBlock.id,
        blockIndex: anchorBlock.blockIndex,
        ...anchorData,
        anchorBlockHash: anchorBlock.blockHash,
        createdAt: anchorBlock.createdAt,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}
