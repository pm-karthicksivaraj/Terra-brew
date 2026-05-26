/**
 * API v1 Authentication & Rate Limiting
 *
 * This module handles API-key-based authentication for the external /api/v1/ namespace.
 * Unlike internal routes that use session cookies or JWT Bearer tokens via getAuthUser(),
 * v1 routes authenticate via API keys stored in the ApiKey table.
 *
 * Rate limiting uses an in-memory Map (no Redis dependency for MVP).
 */

import { db } from '@/lib/db'
import crypto from 'crypto'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface ApiKeyAuthResult {
  valid: true
  tenantId: string
  apiKeyId: string
  keyPrefix: string
  tier: string
  permissions: string[]
}

export interface ApiKeyAuthError {
  valid: false
  error: string
  status: number
}

// ════════════════════════════════════════════════════════════════
// RATE LIMITING (In-Memory)
// ════════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number
  resetAt: number // Unix timestamp in ms
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 100

// Cleanup stale entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Check rate limit for an API key.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
 */
export function checkRateLimit(apiKeyId: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(apiKeyId)

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(apiKeyId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  entry.count++
  return { allowed: true }
}

// ════════════════════════════════════════════════════════════════
// API KEY VALIDATION
// ════════════════════════════════════════════════════════════════

/**
 * Validate an API key from the request.
 *
 * Reads the key from:
 * 1. X-API-Key header (preferred)
 * 2. api_key query parameter (fallback)
 *
 * The raw key is hashed with SHA-256 and compared against the stored keyHash
 * in the ApiKey table. This ensures the raw key is never stored.
 */
export async function validateApiKey(req: Request): Promise<ApiKeyAuthResult | ApiKeyAuthError> {
  // 1. Extract the raw API key
  let rawKey: string | null = null

  // Try X-API-Key header first
  const headerKey = req.headers.get('X-API-Key')
  if (headerKey) {
    rawKey = headerKey
  }

  // Fallback to api_key query parameter
  if (!rawKey) {
    const url = new URL(req.url)
    const queryKey = url.searchParams.get('api_key')
    if (queryKey) {
      rawKey = queryKey
    }
  }

  if (!rawKey) {
    return {
      valid: false,
      error: 'API key required. Provide via X-API-Key header or api_key query parameter.',
      status: 401,
    }
  }

  // 2. Hash the key and look up in the database
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  try {
    const apiKey = await db.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    })

    if (!apiKey) {
      return {
        valid: false,
        error: 'Invalid or revoked API key.',
        status: 401,
      }
    }

    // Check if key has expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return {
        valid: false,
        error: 'API key has expired.',
        status: 401,
      }
    }

    // Check if tenant is active
    if (!apiKey.tenant.isActive) {
      return {
        valid: false,
        error: 'Tenant account is inactive.',
        status: 401,
      }
    }

    // 3. Update lastUsedAt (non-blocking)
    db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {
      // Silently fail — don't block the request
    })

    // 4. Check rate limit
    const rateLimitResult = checkRateLimit(apiKey.id)
    if (!rateLimitResult.allowed) {
      return {
        valid: false,
        error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
        status: 429,
      }
    }

    // 5. Parse permissions
    let permissions: string[] = []
    try {
      permissions = JSON.parse(apiKey.permissions)
    } catch {
      permissions = []
    }

    return {
      valid: true,
      tenantId: apiKey.tenantId,
      apiKeyId: apiKey.id,
      keyPrefix: apiKey.keyPrefix,
      tier: apiKey.tier,
      permissions,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Internal authentication error.',
      status: 500,
    }
  }
}

/**
 * Helper to create a standard error response from auth validation.
 */
export function authErrorResponse(authResult: ApiKeyAuthError): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authResult.status === 429) {
    headers['Retry-After'] = '3600'
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: authResult.error,
    }),
    {
      status: authResult.status,
      headers,
    }
  )
}
