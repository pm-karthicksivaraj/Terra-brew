/**
 * Re-export of the Prisma client for backward compatibility.
 * Primary client is defined in @/lib/db — use `import { db } from '@/lib/db'` when possible.
 * This module exists so that `import { prisma } from '@/lib/prisma'` also works.
 */
export { db as prisma } from '@/lib/db'
