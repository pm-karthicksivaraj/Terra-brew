import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { createTenantSchema, updateTenantSchema } from '@/lib/validators'
import { getAuthUser, requirePlatformAdmin, validateBody, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('id')

    // GET single tenant by ID
    if (tenantId) {
      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
        include: {
          _count: { select: { users: true, farmers: true, farmLands: true, cultivations: true, nurseries: true, landPreparations: true, cropMonitorings: true, fertilizerApplications: true, pestDiseaseManagements: true, harvestTraceabilities: true, collectionCentres: true, procurementRecords: true, processingJobOrders: true, certAssessments: true, coffeeInspections: true, smartContracts: true, marketplaceListings: true, auditLogs: true } },
          users: { select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
          auditLogs: { take: 20, orderBy: { createdAt: 'desc' }, select: { id: true, action: true, entity: true, entityId: true, details: true, ipAddress: true, createdAt: true, userId: true } },
        },
      })
      if (!tenant) return apiError('Tenant not found', 404)
      return apiResponse(tenant)
    }

    // List all tenants
    const { search, page, pageSize } = getPaginationParams(req)
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { slug: { contains: search } },
        { legalName: { contains: search } },
      ],
    } : {}

    const [tenants, total] = await Promise.all([
      db.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { users: true, farmers: true, farmLands: true } },
        },
      }),
      db.tenant.count({ where }),
    ])

    return apiResponse({ tenants, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
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

    // Serialize enabledModules to string for SQLite
    const createData: any = { ...data }
    if (createData.enabledModules && typeof createData.enabledModules === 'object') {
      createData.enabledModules = JSON.stringify(createData.enabledModules)
    }

    const tenant = await db.tenant.create({ data: createData })

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

    // Create audit log
    await db.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user!.id,
        action: 'CREATE',
        entity: 'Tenant',
        entityId: tenant.id,
        details: `Created tenant: ${tenant.name} (${tenant.slug})`,
      },
    })

    return apiResponse({ tenant, adminEmail, adminPassword: 'Admin@2024' }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const body = await req.json()
    const result = validateBody(updateTenantSchema, body)
    if ('error' in result) return result.error

    const { tenantId, ...updateData } = result.data

    // Check tenant exists
    const existing = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) return apiError('Tenant not found', 404)

    // If slug is being updated, check uniqueness
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await db.tenant.findUnique({ where: { slug: updateData.slug } })
      if (slugExists) return apiError('Tenant slug already exists', 409)
    }

    // Serialize enabledModules if present
    const dataToUpdate: any = { ...updateData }
    if (dataToUpdate.enabledModules) {
      dataToUpdate.enabledModules = JSON.stringify(dataToUpdate.enabledModules)
    }

    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: dataToUpdate,
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user!.id,
        action: 'UPDATE',
        entity: 'Tenant',
        entityId: tenantId,
        details: `Updated tenant: ${tenant.name}. Fields: ${Object.keys(updateData).join(', ')}`,
      },
    })

    return apiResponse(tenant)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('id')
    if (!tenantId) return apiError('Tenant ID required', 400)

    // Check tenant exists
    const existing = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) return apiError('Tenant not found', 404)

    // Soft delete — toggle isActive
    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: { isActive: !existing.isActive },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user!.id,
        action: existing.isActive ? 'DELETE' : 'UPDATE',
        entity: 'Tenant',
        entityId: tenantId,
        details: existing.isActive
          ? `Deactivated tenant: ${existing.name}`
          : `Reactivated tenant: ${existing.name}`,
      },
    })

    return apiResponse(tenant)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
