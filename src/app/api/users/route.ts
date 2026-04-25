import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { hashPassword } from '@/lib/crypto'

/**
 * User CRUD within tenant.
 * - Password hash MUST be masked in all responses.
 * - Only tenant_admin can manage users.
 */

function maskUser(user: Record<string, unknown>) {
  const { passwordHash: _ph, ...safeUser } = user
  return { ...safeUser, passwordHash: '********' }
}

export async function GET(req: Request) {
  const user = await getAuthUser()
  const authError = requireTenantAccess(user, 'users', 'read')
  if (authError) return authError

  try {
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const tenantId = user!.tenantId!

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ])

    const maskedItems = items.map((u: Record<string, unknown>) => maskUser(u))

    return apiResponse({ data: maskedItems, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  // Only tenant_admin can create users
  if (user!.role !== 'tenant_admin' && !user!.isPlatformAdmin) {
    return apiError('Only tenant admins can create users', 403)
  }
  const authError = requireTenantAccess(user, 'users', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Hash password if provided
    let passwordHash: string | undefined
    if (body.password) {
      passwordHash = await hashPassword(body.password)
    } else {
      return apiError('Password is required', 400)
    }

    // Remove password from body, use hashed version
    const { password: _pwd, ...rest } = body

    const item = await db.user.create({
      data: {
        ...rest,
        passwordHash,
        tenantId,
      },
    })

    return apiResponse(maskUser(item as Record<string, unknown>), 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  // Only tenant_admin can update users
  if (user!.role !== 'tenant_admin' && !user!.isPlatformAdmin) {
    return apiError('Only tenant admins can update users', 403)
  }
  const authError = requireTenantAccess(user, 'users', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, password, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.user.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('User not found', 404)

    // Hash new password if provided
    const updateData: Record<string, unknown> = { ...data }
    if (password) {
      updateData.passwordHash = await hashPassword(password)
    }

    const item = await db.user.update({
      where: { id },
      data: updateData,
    })

    return apiResponse(maskUser(item as Record<string, unknown>))
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser()
  // Only tenant_admin can delete users
  if (user!.role !== 'tenant_admin' && !user!.isPlatformAdmin) {
    return apiError('Only tenant admins can delete users', 403)
  }
  const authError = requireTenantAccess(user, 'users', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    // Prevent self-deletion
    if (id === user!.id) {
      return apiError('Cannot delete your own account', 400)
    }

    const existing = await db.user.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('User not found', 404)

    const item = await db.user.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(maskUser(item as Record<string, unknown>))
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
