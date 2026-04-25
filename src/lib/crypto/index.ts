/**
 * AES-256-GCM encryption utilities for PII data protection.
 * All sensitive fields (nationalIdNo, accountNumber, contactNumber, email, taxId)
 * are encrypted before storage and decrypted on read based on RBAC permissions.
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.PII_ENCRYPTION_KEY
  if (!key) throw new Error('PII_ENCRYPTION_KEY not configured')
  return Buffer.from(key, 'base64')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const tag = cipher.getAuthTag()
  // Format: iv:tag:ciphertext (all base64)
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted format')
  const iv = Buffer.from(parts[0], 'base64')
  const tag = Buffer.from(parts[1], 'base64')
  const encrypted = parts[2]
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Mask sensitive data for display based on role permissions.
 * e.g., "795284610382" → "7952******382"
 * e.g., "0912345678" → "0912****678"
 * e.g., "nguyen@email.com" → "ng****@email.com"
 */
export function maskString(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars * 2) return value
  const start = value.slice(0, visibleChars)
  const end = value.slice(-visibleChars)
  const masked = '*'.repeat(value.length - visibleChars * 2)
  return `${start}${masked}${end}`
}

export function maskEmail(email: string): string {
  if (!email) return email
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visibleLocal = local.slice(0, 2)
  return `${visibleLocal}****@${domain}`
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone
  return phone.slice(0, 4) + '****' + phone.slice(-3)
}

/**
 * HMAC-SHA256 signing for QR code tamper-proof verification.
 */
export function signQRPayload(payload: string): string {
  const key = process.env.HMAC_SECRET_KEY
  if (!key) throw new Error('HMAC_SECRET_KEY not configured')
  return crypto.createHmac('sha256', key).update(payload).digest('hex')
}

export function verifyQRSignature(payload: string, signature: string): boolean {
  const expected = signQRPayload(payload)
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

/**
 * SHA-256 blockchain hash chain for traceability.
 * Each block's hash = SHA-256(dataHash + previousHash + timestamp)
 */
export function computeDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function computeBlockHash(dataHash: string, previousHash: string, timestamp: string): string {
  return crypto.createHash('sha256')
    .update(dataHash + previousHash + timestamp)
    .digest('hex')
}

/**
 * Hash password with bcrypt (cost factor 12)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}
