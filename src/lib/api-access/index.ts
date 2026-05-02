/**
 * API Key Management Module — Terra Brew Coffee Platform
 *
 * API key generation, validation, revocation, listing, and rate limiting
 * for Enterprise tier API access. Keys are stored as SHA-256 hashes
 * and the raw key is returned only once at creation time.
 */
import crypto from 'crypto'
import { db } from '@/lib/db'

// ════════════════════════════════════════════════════════════════
// RATE LIMITS PER TIER
// ════════════════════════════════════════════════════════════════

export const TIER_RATE_LIMITS: Record<string, number> = {
  starter: 60,
  professional: 300,
  enterprise: 1000,
}

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface ApiKeyResult {
  id: string
  name: string
  key: string       // Only returned on creation
  keyPrefix: string
  permissions: string[]
  tier: string
  rateLimitPerMin: number
  expiresAt: Date | null
}

export interface ApiKeyValidation {
  valid: boolean
  tenantId: string
  permissions: string[]
  tier: string
  rateLimitPerMin: number
  keyId: string
}

export interface ApiKeyListItem {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  tier: string
  rateLimitPerMin: number
  lastUsedAt: Date | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

// ════════════════════════════════════════════════════════════════
// GENERATE API KEY
// ════════════════════════════════════════════════════════════════

export async function generateApiKey(
  tenantId: string,
  name: string,
  permissions: string[] = [],
  tier: string = 'starter'
): Promise<ApiKeyResult> {
  // Generate a secure random API key with prefix
  const rawKey = `tb_${crypto.randomBytes(32).toString('hex')}`
  const keyPrefix = rawKey.slice(0, 8)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const rateLimit = TIER_RATE_LIMITS[tier] || 60

  const apiKey = await db.apiKey.create({
    data: {
      tenantId,
      name,
      keyHash,
      keyPrefix,
      permissions: JSON.stringify(permissions),
      tier,
      rateLimitPerMin: rateLimit,
    },
  })

  return {
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey, // Only time the raw key is available
    keyPrefix: apiKey.keyPrefix,
    permissions,
    tier: apiKey.tier,
    rateLimitPerMin: apiKey.rateLimitPerMin,
    expiresAt: apiKey.expiresAt,
  }
}

// ════════════════════════════════════════════════════════════════
// VALIDATE API KEY
// ════════════════════════════════════════════════════════════════

export async function validateApiKey(
  rawKey: string
): Promise<ApiKeyValidation | null> {
  if (!rawKey || !rawKey.startsWith('tb_')) return null

  try {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const keyPrefix = rawKey.slice(0, 8)

    const apiKey = await db.apiKey.findFirst({
      where: {
        keyPrefix,
        keyHash,
        isActive: true,
      },
    })

    if (!apiKey) return null

    // Check expiry
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null
    }

    // Update lastUsedAt (fire and forget)
    await db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      valid: true,
      tenantId: apiKey.tenantId,
      permissions: JSON.parse(apiKey.permissions || '[]'),
      tier: apiKey.tier,
      rateLimitPerMin: apiKey.rateLimitPerMin,
      keyId: apiKey.id,
    }
  } catch {
    return null
  }
}

// ════════════════════════════════════════════════════════════════
// REVOKE API KEY
// ════════════════════════════════════════════════════════════════

export async function revokeApiKey(keyId: string): Promise<boolean> {
  try {
    const apiKey = await db.apiKey.findUnique({ where: { id: keyId } })
    if (!apiKey) return false

    // Soft-delete by setting isActive to false
    await db.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    })

    return true
  } catch {
    return false
  }
}

// ════════════════════════════════════════════════════════════════
// LIST API KEYS
// ════════════════════════════════════════════════════════════════

export async function listApiKeys(tenantId: string): Promise<ApiKeyListItem[]> {
  const keys = await db.apiKey.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })

  return keys.map(key => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    permissions: JSON.parse(key.permissions || '[]'),
    tier: key.tier,
    rateLimitPerMin: key.rateLimitPerMin,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    isActive: key.isActive,
    createdAt: key.createdAt,
  }))
}

// ════════════════════════════════════════════════════════════════
// IN-MEMORY RATE LIMITER
// ════════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(keyPrefix: string, limit: number): RateLimitResult {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const entry = rateLimitStore.get(keyPrefix)

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs
    rateLimitStore.set(keyPrefix, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) rateLimitStore.delete(key)
  }
}, 60 * 1000)
