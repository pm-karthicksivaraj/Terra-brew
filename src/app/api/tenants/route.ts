import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { createTenantSchema } from '@/lib/validators'
import { getAuthUser, requirePlatformAdmin, validateBody, apiResponse, apiError } from '@/lib/api-middleware'

export async function GET() {
  const user = await getAuthUser()
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const tenants = await db.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, farmers: true, farmLands: true } },
      },
    })
    return apiResponse(tenants)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const body = await req.json()
    const result = validateBody(createTenantSchema, body)
    if ('error' in result) return result.error

    const data = result.data

    // Check slug uniqueness
    const existing = await db.tenant.findUnique({ where: { slug: data.slug } })
    if (existing) return apiError('Tenant slug already exists', 409)

    const tenant = await db.tenant.create({ data })

    // Create tenant admin user
    const adminEmail = `admin@${data.slug}.terrabrew.com`
    const passwordHash = await hashPassword('Admin@2024')
    await db.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: `${data.name} Admin`,
        role: 'tenant_admin',
        tenantId: tenant.id,
      },
    })

    return apiResponse({ tenant, adminEmail, adminPassword: 'Admin@2024' }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
