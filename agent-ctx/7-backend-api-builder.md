# Task 7: Backend API Builder

## Summary
Built 5 backend API endpoints for the Metrang Coffee Traceability Platform.

## Files Created

1. **`/src/app/api/mobile/auth/route.ts`** — Mobile JWT Authentication
   - POST endpoint accepting `{ email, password, tenantSlug }`
   - Validates credentials using same logic as NextAuth tenant-login provider
   - Returns signed JWT (HS256, 24h expiry) with user claims
   - Uses `tenantLoginSchema` for Zod validation

2. **`/src/app/api/public/verify/[qrCode]/route.ts`** — Public QR/NFC Verification (NO AUTH)
   - GET endpoint with `qrCode` as URL path parameter
   - Verifies HMAC signature using `verifyQRSignature`
   - Fetches entity details and verifies hash chain integrity using `computeDataHash`/`computeBlockHash`
   - Masks PII fields (farmer name partial, national ID hidden, contact number masked, email masked)
   - Increments scan count on each access
   - Returns consumer-friendly traceability data

3. **`/src/app/api/nfc/route.ts`** — NFC Tag Management
   - GET: Paginated list of NFC tags (QRVerification records with `NFC-` prefix)
   - POST: Create NFC verification record with `NFC_{entityType}` prefix, HMAC signature, and hash chain block
   - PUT: Verify NFC tap (consumer-facing, similar to public verify but NFC-specific)

4. **`/src/app/api/on-chain/anchor/route.ts`** — On-Chain Anchoring
   - POST: Anchors batch's hash chain on-chain by computing Merkle root from all block hashes
   - Verifies chain integrity before anchoring
   - Stores anchor as HashChainBlock with `stage="on_chain_anchor"`
   - Includes simulated tx hash and block number
   - GET: Returns anchor status for a batch

5. **`/src/app/api/mobile/sync/route.ts`** — Mobile Offline Sync
   - GET: Incremental pull — returns records modified after `since` timestamp for tenant
   - POST: Push offline changes with conflict detection in Prisma transaction
   - Supports create/update/delete actions with conflict resolution (server updatedAt > clientTimestamp = conflict)
   - Maps 15 entity types to their Prisma delegates

## Testing Results
- ✅ Mobile auth returns JWT on valid credentials
- ✅ Mobile auth rejects invalid credentials (401)
- ✅ Public verify accessible without auth, returns not_found for unknown QR codes
- ✅ NFC/anchor/sync endpoints correctly require authentication (401)
- ✅ ESLint: 0 errors, 0 warnings
